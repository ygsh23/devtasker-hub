
import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { PageContainer } from "@/components/layout/page-container";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskForm } from "@/components/tasks/task-form";
import { Task, TaskStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/use-tasks";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Index() {
  const { user, profile } = useAuth();
  const { tasks, loading, createTask, updateTask, deleteTask, updateTaskStatus } = useTasks();
  const [taskFormOpen, setTaskFormOpen] = React.useState(false);
  const [currentTask, setCurrentTask] = React.useState<Task | undefined>(undefined);
  
  // Open task form for creating a new task
  const openCreateTaskForm = () => {
    setCurrentTask(undefined);
    setTaskFormOpen(true);
  };
  
  // Open task form for editing an existing task
  const openEditTaskForm = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setCurrentTask(task);
      setTaskFormOpen(true);
    }
  };
  
  // Handle task form submission (create or update)
  const handleTaskFormSubmit = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
    if (currentTask) {
      updateTask(currentTask.id, taskData);
    } else {
      createTask(taskData);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar user={profile} />
        
        <PageContainer>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Task Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your tasks and track your progress
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <TaskBoard
              tasks={tasks}
              onCreateTask={openCreateTaskForm}
              onEditTask={openEditTaskForm}
              onDeleteTask={deleteTask}
              onUpdateTaskStatus={updateTaskStatus}
            />
          )}
          
          <TaskForm
            open={taskFormOpen}
            onOpenChange={setTaskFormOpen}
            task={currentTask}
            onSubmit={handleTaskFormSubmit}
          />
        </PageContainer>
      </div>
    </ProtectedRoute>
  );
}
