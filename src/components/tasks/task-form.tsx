
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Task, Priority, TaskStatus } from "@/types";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSubmit: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy">) => void;
}

const initialTask: Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy"> = {
  title: "",
  description: "",
  dueDate: new Date(),
  priority: "medium",
  status: "todo",
  assignedTo: "",
};

export function TaskForm({ open, onOpenChange, task, onSubmit }: TaskFormProps) {
  const [formData, setFormData] = React.useState<Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy">>(
    task ? 
      {
        title: task.title,
        description: task.description,
        dueDate: new Date(task.dueDate),
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo,
      } : 
      initialTask
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [users, setUsers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Reset form when dialog opens/closes or task changes
  React.useEffect(() => {
    if (open) {
      setFormData(
        task ?
          {
            title: task.title,
            description: task.description,
            dueDate: new Date(task.dueDate),
            priority: task.priority,
            status: task.status,
            assignedTo: task.assignedTo,
          } :
          {
            ...initialTask,
            assignedTo: user?.id || ""
          }
      );
      fetchUsers();
    }
  }, [open, task, user]);
  
  // Fetch users for assignment dropdown
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name');
      
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Handle form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, dueDate: date }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      
      if (!formData.assignedTo) {
        throw new Error("Assignee is required");
      }
      
      // Submit form
      onSubmit(formData);
      
      // Close dialog
      onOpenChange(false);
    } catch (error: any) {
      // Show error message
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task description"
              className="h-20 focus-ring"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="dueDate"
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={handleDateChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger id="priority" className="focus-ring">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => handleSelectChange("assignedTo", value)}
            >
              <SelectTrigger id="assignedTo" className="focus-ring">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {loadingUsers ? (
                  <div className="p-2 text-center text-sm">Loading users...</div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {task && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status" className="focus-ring">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <DialogFooter className="pt-2">
            <CustomButton 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit" loading={isLoading}>
              {task ? "Update Task" : "Create Task"}
            </CustomButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
