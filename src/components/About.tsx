'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { content } from '@/lib/content';

const StatItem = ({ value, label, index }: { value: string, label: string, index: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    // Parse number and suffix
    const match = value.match(/^(\d+)(.*)$/);
    const numericValue = match ? parseInt(match[1]) : 0;
    const isNumber = !!match;
    const suffix = match ? match[2] : value;

    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { duration: 2500, bounce: 0 });

    useEffect(() => {
        if (isInView && isNumber) {
            motionValue.set(numericValue);
        }
    }, [isInView, isNumber, numericValue, motionValue]);

    // Format for display
    const formattedValue = React.useSyncExternalStore(
        (callback) => springValue.on("change", callback),
        () => {
            if (!isNumber) return value;
            return `${Math.floor(springValue.get())}${suffix}`;
        },
        () => value // server-side fallback
    );

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: index * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="group relative p-8 rounded-3xl bg-white/50 border border-slate-100 backdrop-blur-sm hover:bg-white hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 flex flex-col items-center text-center"
        >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-brand-600 to-blue-800 mb-3 group-hover:scale-110 transition-transform duration-500 origin-center font-heading">
                {formattedValue}
            </div>
            <div className="text-slate-600 font-medium text-base tracking-wide">
                {label}
            </div>
        </motion.div>
    );
};

export const About = () => {
    return (
        <section id="about" className="py-32 relative overflow-hidden bg-white">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-50/50 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center mb-20"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-900 font-heading tracking-tight">
                        {content.mission.title}
                    </h2>
                    <p className="text-xl text-slate-600 leading-relaxed font-light">
                        {content.mission.description}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {content.mission.stats.map((stat, index) => (
                        <StatItem key={index} value={stat.number} label={stat.label} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};
