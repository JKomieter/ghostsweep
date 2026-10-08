"use client";

import { useEffect, useRef } from "react";

export default function RiskRadar({
  totalCount,
  criticalCount,
  isScanning,
}: {
  totalCount: number;
  criticalCount: number;
  isScanning: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let angle = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 8;

      ctx.clearRect(0, 0, w, h);

      // Concentric rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Cross-hairs
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      // Sweep gradient
      const sweepGrad = ctx.createConicGradient?.(angle, cx, cy);
      if (sweepGrad) {
        sweepGrad.addColorStop(0, "rgba(0,255,65,0.25)");
        sweepGrad.addColorStop(0.15, "rgba(0,255,65,0)");
        sweepGrad.addColorStop(1, "rgba(0,255,65,0)");
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle - 0.6, angle);
        ctx.closePath();
        ctx.fillStyle = sweepGrad;
        ctx.fill();
      } else {
        // Fallback sweep line
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        const grad = ctx.createLinearGradient(0, 0, radius, 0);
        grad.addColorStop(0, "rgba(0,255,65,0.4)");
        grad.addColorStop(1, "rgba(0,255,65,0)");
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius, 0);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sweep trail
        for (let i = 0; i < 30; i++) {
          const trailAngle = -(i * 0.02);
          const alpha = 0.08 * (1 - i / 30);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.rotate(trailAngle);
          ctx.lineTo(radius, 0);
          ctx.strokeStyle = `rgba(0,255,65,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.rotate(-trailAngle);
        }
        ctx.restore();
      }

      // Blips (simulated data points)
      const blipCount = Math.min(totalCount, 20);
      for (let i = 0; i < blipCount; i++) {
        const seed = i * 137.5;
        const r = ((seed * 7) % radius) * 0.85 + radius * 0.1;
        const a = ((seed * 13) % 360) * (Math.PI / 180);
        const bx = cx + Math.cos(a) * r;
        const by = cy + Math.sin(a) * r;

        const isCritical = i < criticalCount;
        const angleDiff = Math.abs(
          ((a - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
        );
        const brightness = angleDiff < 0.8 ? 1 : 0.3;

        ctx.beginPath();
        ctx.arc(bx, by, isCritical ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = isCritical
          ? `rgba(255,49,49,${brightness})`
          : `rgba(0,255,65,${brightness * 0.8})`;
        ctx.fill();

        if (isCritical && brightness > 0.5) {
          ctx.beginPath();
          ctx.arc(bx, by, 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,49,49,0.15)";
          ctx.fill();
        }
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#00FF41";
      ctx.fill();

      angle += isScanning ? 0.03 : 0.008;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [totalCount, criticalCount, isScanning]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        className="opacity-90"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[11px] font-medium uppercase tracking-widest text-foreground/40">
          Shadow Footprint
        </span>
        <span className="text-5xl font-light tracking-tight text-foreground mt-1">
          {totalCount}
        </span>
        {criticalCount > 0 && (
          <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {criticalCount} critical
          </span>
        )}
      </div>
    </div>
  );
}
