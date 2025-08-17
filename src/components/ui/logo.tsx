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
    <img
      src="/lovable-uploads/0bb1fa68-8f72-4b82-aa3a-0707d95cd69a.png"
      alt="MRxCompliance Logo"
      className={cn(sizeClasses[size], "object-contain", className)}
    />
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