'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { content } from '@/lib/content';

export const Testimonials = () => {
    return (
        <section id="testimonials" className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">Ce Que Disent Nos Talents</h2>
                    <p className="text-slate-600">Ne nous croyez pas sur parole, écoutez-les.</p>
                </motion.div>

                <div className="relative w-full overflow-hidden">
                    <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                        {/* Render twice for seamless loop */}
                        {[...content.testimonials, ...content.testimonials].map((testimonial, index) => (
                            <div
                                key={index}
                                className="w-[300px] md:w-[400px] mx-4 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative hover:shadow-lg transition-shadow flex-shrink-0"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 mb-6 leading-relaxed italic line-clamp-4">
                                    &quot;{testimonial.content}&quot;
                                </p>
                                <div>
                                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                                    <div className="text-sm text-primary-600">{testimonial.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
