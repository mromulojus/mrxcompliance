"use client";
import { useEffect, useRef } from "react";

function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Simplified fluid simulation for performance
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{x: number, y: number, vx: number, vy: number, life: number}> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (x: number, y: number) => {
      const count = Math.random() * 10 + 5;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 50,
          y: y + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 1.0
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        if (particle.life > 0) {
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.life * 3, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      createParticle(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.touches.length; i++) {
        createParticle(e.touches[i].clientX, e.touches[i].clientY);
      }
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 z-0 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="w-screen h-screen opacity-30"
        style={{ background: 'transparent' }}
      />
    </div>
  );
}

export { SplashCursor };