
import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function PageContainer({ 
  children, 
  maxWidth = "2xl",
  className,
  ...props 
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "px-4 py-8 md:px-6 md:py-12 lg:py-16 mx-auto animate-fade-in",
        {
          "max-w-screen-sm": maxWidth === "sm",
          "max-w-screen-md": maxWidth === "md",
          "max-w-screen-lg": maxWidth === "lg",
          "max-w-screen-xl": maxWidth === "xl",
          "max-w-screen-2xl": maxWidth === "2xl",
          "max-w-full": maxWidth === "full",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
