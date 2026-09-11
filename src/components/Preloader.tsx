'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Preloader = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000); // Animation duration

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
                >
                    <div className="relative overflow-hidden">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight"
                        >
                            TalentiQues
                            <span className="text-primary-600">.</span>
                        </motion.h1>

                        {/* Shimmer effect line */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
                            className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
