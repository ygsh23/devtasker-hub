
import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { Navbar } from "@/components/layout/navbar";
import { PageContainer } from "@/components/layout/page-container";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskForm } from "@/components/tasks/task-form";
import { Task, TaskStatus } from "@/types";

// Mock user data
const mockUser = {
  name: "Demo User",
  email: "demo@example.com",
};

// Mock tasks
const generateMockTasks = (): Task[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return [
    {
      id: uuidv4(),
      title: "Complete DevTaskr Dashboard",
      description: "Implement the dashboard UI with task cards and Kanban board layout.",
      dueDate: tomorrow,
      priority: "high",
      status: "in-progress",
      assignedTo: "demo@example.com",
      createdBy: "manager@example.com",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Add Authentication Features",
      description: "Implement user signup, login and session management with Supabase.",
      dueDate: nextWeek,
      priority: "medium",
      status: "todo",
      assignedTo: "demo@example.com",
      createdBy: "manager@example.com",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Setup Email Notification Service",
      description: "Configure AWS SES for sending email notifications when tasks are completed.",
      dueDate: nextWeek,
      priority: "low",
      status: "todo",
      assignedTo: "demo@example.com",
      createdBy: "manager@example.com",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Initial Project Setup",
      description: "Initialize the project repository and configure basic dependencies.",
      dueDate: new Date(now.getTime() - 86400000),
      priority: "urgent",
      status: "completed",
      assignedTo: "demo@example.com",
      createdBy: "manager@example.com",
      createdAt: new Date(now.getTime() - 172800000),
      updatedAt: now,
    },
  ];
};

export default function Index() {
  const [tasks, setTasks] = React.useState<Task[]>(generateMockTasks());
  const [taskFormOpen, setTaskFormOpen] = React.useState(false);
  const [currentTask, setCurrentTask] = React.useState<Task | undefined>(undefined);
  
  // Create new task
  const handleCreateTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const newTask: Task = {
      id: uuidv4(),
      ...taskData,
      createdAt: now,
      updatedAt: now,
    };
    
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };
  
  // Update task
  const handleUpdateTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!currentTask) return;
    
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === currentTask.id
          ? {
              ...task,
              ...taskData,
              updatedAt: new Date(),
            }
          : task
      )
    );
  };
  
  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };
  
  // Update task status
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              updatedAt: new Date(),
            }
          : task
      )
    );
  };
  
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
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />
      
      <PageContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Task Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track your progress
          </p>
        </div>
        
        <TaskBoard
          tasks={tasks}
          onCreateTask={openCreateTaskForm}
          onEditTask={openEditTaskForm}
          onDeleteTask={handleDeleteTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
        />
        
        <TaskForm
          open={taskFormOpen}
          onOpenChange={setTaskFormOpen}
          task={currentTask}
          onSubmit={currentTask ? handleUpdateTask : handleCreateTask}
        />
      </PageContainer>
    </div>
  );
}
