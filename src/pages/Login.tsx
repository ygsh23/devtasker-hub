
import { AuthForm } from "@/components/auth/auth-form";
import { PageContainer } from "@/components/layout/page-container";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <PageContainer maxWidth="sm" className="py-8 md:py-12">
        <AuthForm type="login" />
      </PageContainer>
    </div>
  );
}
