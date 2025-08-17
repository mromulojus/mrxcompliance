import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, Target } from "lucide-react";
import { Link } from "react-router-dom";
export function HeroSection() {
  return <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse" />
    </section>;
}