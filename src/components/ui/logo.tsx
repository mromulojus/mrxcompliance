import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "icon";
}

export function Logo({ className, size = "md", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const IconSvg = () => (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeClasses[size], className)}
      fill="currentColor"
    >
      <path d="M15 20C15 11.7157 21.7157 5 30 5H40C44.4183 5 48 8.58172 48 13V87C48 91.4183 44.4183 95 40 95H30C21.7157 95 15 88.2843 15 80V20Z"/>
      <path d="M70 20C70 11.7157 76.7157 5 85 5H95C95 5 95 95 95 95H85C76.7157 95 70 88.2843 70 80V20Z"/>
      <path d="M32 35C40 30 50 25 60 35C65 40 65 45 55 50C50 55 45 60 40 65C35 55 25 45 32 35Z"/>
    </svg>
  );

  if (variant === "icon") {
    return <IconSvg />;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <IconSvg />
      <div className="flex items-center gap-1 text-sm font-semibold">
        <span className="text-primary">PLAN</span>
        <span className="text-muted-foreground">{">"}</span>
        <span className="text-secondary">CHECK</span>
        <span className="text-muted-foreground">{">"}</span>
        <span className="text-accent">CONTROL</span>
      </div>
    </div>
  );
}