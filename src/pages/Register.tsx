
import { AuthForm } from "@/components/auth/auth-form";
import { PageContainer } from "@/components/layout/page-container";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Register() {
  const { user, loading } = useAuth();
  
  // If already authenticated, redirect to home
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <PageContainer maxWidth="sm" className="py-8 md:py-12">
        <AuthForm type="register" />
      </PageContainer>
    </div>
  );
}
