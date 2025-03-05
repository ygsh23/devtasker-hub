
import * as React from "react";
import { Plus } from "lucide-react";
import { Task, TaskStatus } from "@/types";
import { TaskCard } from "./task-card";
import { CustomButton } from "@/components/ui/custom-button";
import { useToast } from "@/hooks/use-toast";

interface TaskBoardProps {
  tasks: Task[];
  onCreateTask: () => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export function TaskBoard({
  tasks,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus,
}: TaskBoardProps) {
  const { toast } = useToast();

  // Group tasks by status
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  // Handle status change
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTaskStatus(taskId, newStatus);
    
    if (newStatus === "completed") {
      toast({
        title: "Task completed",
        description: "An email notification has been sent",
      });
    } else {
      toast({
        title: "Task updated",
        description: `Task status changed to ${newStatus === "todo" ? "To Do" : "In Progress"}`,
      });
    }
  };

  // Render a column
  const renderColumn = (title: string, columnTasks: Task[], status: TaskStatus) => (
    <div className="flex flex-col h-full min-h-[70vh] w-full min-w-[300px] max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {columnTasks.length}
        </span>
      </div>
      
      {status === "todo" && (
        <CustomButton 
          onClick={onCreateTask}
          className="mb-4"
          variant="outline"
        >
          <Plus size={16} className="mr-2" />
          Add New Task
        </CustomButton>
      )}
      
      <div className="space-y-4 flex-1 overflow-auto pr-2 pt-2">
        {columnTasks.length > 0 ? (
          columnTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        ) : (
          <div className="h-32 border rounded-lg border-dashed flex items-center justify-center text-muted-foreground">
            {status === "todo" ? (
              <p>No tasks to do yet</p>
            ) : status === "in-progress" ? (
              <p>No tasks in progress</p>
            ) : (
              <p>No completed tasks yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {renderColumn("To Do", todoTasks, "todo")}
      {renderColumn("In Progress", inProgressTasks, "in-progress")}
      {renderColumn("Completed", completedTasks, "completed")}
    </div>
  );
}
