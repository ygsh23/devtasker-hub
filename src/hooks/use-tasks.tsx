
import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, Priority } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useTasks() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch tasks from Supabase
  const fetchTasks = React.useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Fixed the query to properly handle the relationship
      const { data, error } = await supabase
        .from("tasks")
        .select("*, assigned_to:profiles(id, name, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Transform Supabase data to match our Task type
      const formattedTasks = data.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: new Date(task.due_date),
        priority: task.priority as Priority,  // Explicitly cast to Priority type
        status: task.status as TaskStatus,    // Explicitly cast to TaskStatus type
        assignedTo: task.assigned_to?.id || task.assigned_to, // Handle both object and string formats
        assigneeName: task.assigned_to?.name || null, // Store assignee name for display
        createdBy: task.created_by,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Create a new task
  const createTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
    try {
      if (!user) throw new Error("You must be logged in to create tasks");
      
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.dueDate.toISOString(),
          priority: taskData.priority,
          status: taskData.status,
          assigned_to: taskData.assignedTo,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the new task to the state
      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.due_date),
        priority: data.priority as Priority,  // Explicitly cast to Priority type
        status: data.status as TaskStatus,    // Explicitly cast to TaskStatus type
        assignedTo: data.assigned_to,
        assigneeName: null, // We'll fetch this on the next refresh
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setTasks((prevTasks) => [newTask, ...prevTasks]);

      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      });

      return newTask;
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update an existing task
  const updateTask = async (
    taskId: string,
    taskData: Partial<Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy">>
  ) => {
    try {
      const updateData: any = {};
      
      if (taskData.title !== undefined) updateData.title = taskData.title;
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate.toISOString();
      if (taskData.priority !== undefined) updateData.priority = taskData.priority;
      if (taskData.status !== undefined) updateData.status = taskData.status;
      if (taskData.assignedTo !== undefined) updateData.assigned_to = taskData.assignedTo;

      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update the task in the state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...taskData,
                updatedAt: new Date(data.updated_at)
              }
            : task
        )
      );

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
      });

      // If the task status is changed to completed, send a notification
      if (taskData.status === "completed") {
        await sendTaskCompletionEmail(taskId);
      }

      return true;
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        throw error;
      }

      // Remove the task from the state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully",
      });

      return true;
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
      return false;
    }
  };

  // Send an email notification when a task is completed
  const sendTaskCompletionEmail = async (taskId: string, message?: string) => {
    try {
      console.log("Sending email notification for task:", taskId);
      
      const response = await supabase.functions.invoke("send-task-notification", {
        body: {
          taskId,
          message: message || "Task has been completed successfully."
        },
      });

      if (response.error) {
        console.error("Function response error:", response.error);
        throw new Error(response.error);
      }

      toast({
        title: "Notification sent",
        description: "An email notification has been sent to the manager",
      });

      return true;
    } catch (error: any) {
      console.error("Error sending email notification:", error);
      toast({
        title: "Warning",
        description: "Task updated but failed to send email notification",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    return updateTask(taskId, { status });
  };

  // Load tasks on component mount only once and when user changes
  React.useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Set up real-time subscription to tasks for live updates
  React.useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTasks]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    sendTaskCompletionEmail,
    refreshTasks: fetchTasks
  };
}
