
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  type: "login" | "register";
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real implementation, this would connect to Supabase
      // For now, we'll just simulate a successful auth
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (type === "login") {
        toast({
          title: "Success",
          description: "You have successfully logged in",
        });
        navigate("/");
      } else {
        toast({
          title: "Account created",
          description: "Please check your email for verification",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: type === "login" ? "Invalid credentials" : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in glass p-8 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {type === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {type === "login"
              ? "Enter your email below to login to your account"
              : "Enter your information below to create your account"}
          </p>
        </div>

        {type === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="focus-ring"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="focus-ring"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {type === "login" && (
              <a
                href="#"
                className="text-sm text-primary hover:underline smooth-transition"
              >
                Forgot password?
              </a>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="focus-ring"
          />
        </div>

        <CustomButton type="submit" fullWidth loading={isLoading}>
          {type === "login" ? "Sign In" : "Sign Up"}
        </CustomButton>

        <div className="text-center text-sm">
          {type === "login" ? (
            <p>
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-primary hover:underline smooth-transition"
              >
                Sign up
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <a
                href="/login"
                className="text-primary hover:underline smooth-transition"
              >
                Sign in
              </a>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
