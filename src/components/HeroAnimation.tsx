'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
    x: number;
    y: number;
    vy: number;
    size: number;
    alpha: number;
}

export const HeroAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let width = 0;
        let height = 0;

        const particleCount = 28;

        const resize = () => {
            const bounds = canvas.getBoundingClientRect();
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            width = bounds.width;
            height = bounds.height;
            canvas.width = Math.max(1, Math.floor(width * ratio));
            canvas.height = Math.max(1, Math.floor(height * ratio));
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vy: -(Math.random() * 0.16 + 0.08),
                    size: Math.random() * 1.6 + 0.7,
                    alpha: Math.random() * 0.18 + 0.08
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                if (!shouldReduceMotion) {
                    p.y += p.vy;
                    if (p.y < -10) p.y = height + 10;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(6, 131, 201, ${p.alpha})`;
                ctx.fill();
            });
            if (!shouldReduceMotion) animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [shouldReduceMotion]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ opacity: 0.72 }}
        />
    );
};
