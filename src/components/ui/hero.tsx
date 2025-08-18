"use client";

import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import HeroBadge from "@/components/ui/hero-badge";

const ease = [0.16, 1, 0.3, 1] as const;

interface HeroContentProps {
  title: string;
  titleHighlight?: string;
  description: string;
  primaryAction?: {
    href: string;
    text: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    href: string;
    text: string;
    icon?: React.ReactNode;
  };
}

function HeroContent({ title, titleHighlight, description, primaryAction, secondaryAction }: HeroContentProps) {
  return (
    <div className="flex flex-col space-y-4">
      <motion.h1
        className="text-3xl font-bold tracking-tight leading-tight sm:text-5xl lg:text-6xl xl:text-7xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        {title} {titleHighlight && <span className="text-primary">{titleHighlight}</span>}
      </motion.h1>
      <motion.p
        className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease }}
      >
        {description}
      </motion.p>
      <motion.div
        className="flex flex-col sm:flex-row gap-4 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease }}
      >
        {primaryAction && (
          <Link
            to={primaryAction.href}
            className={cn(buttonVariants({ size: "lg" }), "gap-2 w-full sm:w-auto justify-center")}
          >
            {primaryAction.icon}
            {primaryAction.text}
          </Link>
        )}
        {secondaryAction && (
          <Link
            to={secondaryAction.href}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 w-full sm:w-auto justify-center")}
          >
            {secondaryAction.icon}
            {secondaryAction.text}
          </Link>
        )}
      </motion.div>
    </div>
  );
}

interface HeroProps {
  pill?: {
    href?: string;
    text: string;
    icon?: React.ReactNode;
    endIcon?: React.ReactNode;
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    className?: string;
  };
  content: HeroContentProps;
  preview?: React.ReactNode;
}

const Hero = ({ pill, content, preview }: HeroProps) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_10%_-10%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(1200px_600px_at_90%_10%,hsl(var(--accent-foreground)/0.06),transparent_60%)]" />
      <div className="container">
        <div className="flex min-h-[calc(100vh-80px)] flex-col lg:flex-row items-center py-12 md:py-20">
          <div className="flex flex-col gap-5 w-full lg:max-w-3xl">
            {pill && <HeroBadge {...pill} />}
            <HeroContent {...content} />
          </div>
          {preview && (
            <div className="w-full lg:max-w-xl lg:pl-16 mt-12 lg:mt-0">
              <div className="relative group rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-sm overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(600px_200px_at_20%_0%,hsl(var(--primary)/0.08),transparent_60%)]" />
                <div className="p-3 md:p-4">
                  {preview}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Hero };

