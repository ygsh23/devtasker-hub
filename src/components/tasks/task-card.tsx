
import * as React from "react";
import { Calendar, Clock, MoreHorizontal, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, Priority, TaskStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [assignee, setAssignee] = React.useState<{name: string, email?: string} | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Fetch assignee details if not already included
  React.useEffect(() => {
    const fetchAssignee = async () => {
      // Only fetch if we don't already have the assignee name
      if (task.assignedTo && !task.assigneeName && !assignee) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', task.assignedTo)
          .single();
          
        if (!error && data) {
          setAssignee(data);
        }
      } else if (task.assigneeName) {
        // Use the provided assignee name
        setAssignee({ name: task.assigneeName });
      }
    };
    
    fetchAssignee();
  }, [task.assignedTo, task.assigneeName, assignee]);

  // Format the due date to display as "Jan 12" or similar
  const formattedDate = format(new Date(task.dueDate), "MMM d");
  
  // Determine if the task is overdue
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed";

  // Get the priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "low":
        return "bg-priority-low";
      case "medium":
        return "bg-priority-medium";
      case "high":
        return "bg-priority-high";
      case "urgent":
        return "bg-priority-urgent";
      default:
        return "bg-priority-low";
    }
  };

  // Get the status text
  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "To Do";
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus: TaskStatus) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
    setIsMenuOpen(false);
  };

  // Handle edit click
  const handleEdit = () => {
    if (onEdit) {
      onEdit(task.id);
    }
    setIsMenuOpen(false);
  };

  // Handle delete click
  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine the assignee name to display
  const displayName = task.assigneeName || assignee?.name || 'Unknown';

  return (
    <div className={cn(
      "bg-card p-4 rounded-lg border shadow-sm animate-scale hover:shadow-md smooth-transition",
      {
        "opacity-80": task.status === "completed",
      }
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "h-2 w-2 rounded-full",
              getPriorityColor(task.priority)
            )} />
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {task.priority}
            </span>
          </div>
          <h3 className="font-medium leading-none">{task.title}</h3>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent smooth-transition"
          >
            <MoreHorizontal size={16} />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 glass rounded-lg shadow-lg overflow-hidden z-10 animate-scale">
              <div className="p-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Change Status
                </div>
                <button
                  onClick={() => handleStatusChange("todo")}
                  className="flex items-center gap-2 p-2 text-sm rounded-md w-full text-left hover:bg-accent smooth-transition"
                >
                  To Do
                </button>
                <button
                  onClick={() => handleStatusChange("in-progress")}
                  className="flex items-center gap-2 p-2 text-sm rounded-md w-full text-left hover:bg-accent smooth-transition"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange("completed")}
                  className="flex items-center gap-2 p-2 text-sm rounded-md w-full text-left hover:bg-accent smooth-transition"
                >
                  Completed
                </button>
                <div className="border-t my-1"></div>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 p-2 text-sm rounded-md w-full text-left hover:bg-accent smooth-transition"
                >
                  Edit Task
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 p-2 text-sm rounded-md w-full text-left text-destructive hover:bg-accent smooth-transition"
                >
                  Delete Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {task.description}
      </p>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User size={14} />
            <span>{displayName}</span>
          </div>
          
          <div className="flex items-center">
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              {
                "bg-primary/10 text-primary": task.status === "in-progress",
                "bg-muted text-muted-foreground": task.status === "todo",
                "bg-priority-low/10 text-priority-low": task.status === "completed",
              }
            )}>
              {getStatusText(task.status)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className={cn(
            "flex items-center gap-1.5",
            isOverdue ? "text-destructive" : "text-muted-foreground"
          )}>
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={14} />
            <span>{format(new Date(task.createdAt), "MMM d")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
