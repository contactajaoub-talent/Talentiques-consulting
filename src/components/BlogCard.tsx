'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowUpRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    image: string;
    date: string;
    readTime: string;
    author: string;
    slug: string;
}

interface BlogCardProps {
    post: BlogPost;
    index: number;
}

export const BlogCard = ({ post, index }: BlogCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-900/10 transition-all duration-500"
        >
            {/* Image Container with Zoom Effect */}
            <div className="relative h-60 overflow-hidden bg-gradient-to-br from-slate-100 to-brand-50/50 flex items-center justify-center group-hover:bg-brand-50/80 transition-colors duration-500">
                <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-brand-700 rounded-lg shadow-sm">
                        {post.category}
                    </span>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />

                {/* Placeholder Content */}
                <div className="flex flex-col items-center gap-3 transform group-hover:scale-110 transition-transform duration-700 ease-out p-6 text-center z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-brand-500/10 flex items-center justify-center text-brand-300 group-hover:text-brand-600 transition-colors">
                        <span className="text-2xl">✨</span>
                    </div>
                    <div>
                        <span className="text-sm font-bold text-slate-400 group-hover:text-brand-600 uppercase tracking-widest transition-colors">
                            Bientôt Disponible
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-6 md:p-8">
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {post.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {post.readTime}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors leading-tight font-heading">
                    <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {post.title}
                    </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                    {post.excerpt}
                </p>

                {/* Footer / Author */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{post.author}</span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1">
                        <ArrowUpRight size={16} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
