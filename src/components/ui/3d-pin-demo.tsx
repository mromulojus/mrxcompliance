"use client";
import React from "react";
import { PinContainer } from "@/components/ui/3d-pin";

export function AnimatedPinDemo() {
  return (
    <div className="h-[40rem] w-full flex items-center justify-center bg-foreground dark:bg-background">
      <PinContainer title="Explore Space" href="https://github.com/serafimcloud">
        <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-[20rem] h-[20rem] bg-gradient-to-b from-slate-800/50 to-slate-800/0 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-red-500 animate-pulse" />
            <div className="text-xs text-slate-400">Live Connection</div>
          </div>

          {/* Content */}
          <div className="flex-1 mt-4 space-y-4">
            <div className="text-2xl font-bold text-slate-100">
              Space Station Alpha
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-sky-400">427</div>
                <div className="text-xs text-slate-400">Days in Orbit</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-emerald-400">98%</div>
                <div className="text-xs text-slate-400">Systems Online</div>
              </div>
            </div>

            {/* Animated Waves */}
            <div className="relative h-20 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="absolute w-full h-20"
                  style={{
                    background: "linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)",
                    animation: `wave ${2 + i * 0.5}s ease-in-out infinite`,
                    opacity: 0.3 / i,
                    transform: `translateY(${i * 10}px)`,
                  }}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div className="text-xs text-slate-400">
                Last ping: 3 seconds ago
              </div>
              <div className="text-sky-400 text-sm font-medium">
                Connect →
              </div>
            </div>
          </div>
        </div>
      </PinContainer>
    </div>
  );
}