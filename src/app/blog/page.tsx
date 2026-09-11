'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BlogCard } from '@/components/BlogCard';
import { content } from '@/lib/content';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tout');

    const filteredPosts = content.blog.posts.filter(post => {
        const matchesCategory = activeCategory === 'Tout' || post.category === activeCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-40 pb-20 px-4 md:px-6 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-200/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-brand-600 font-bold text-sm mb-8 shadow-sm"
                    >
                        <Sparkles size={14} />
                        <span>Blog & Ressources</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold mb-6 font-heading tracking-tight text-slate-900"
                    >
                        {content.blog.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-light"
                    >
                        {content.blog.subtitle}
                    </motion.p>

                    {/* --- SEARCH & FILTERS --- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center gap-8"
                    >
                        {/* Search Bar */}
                        <div className="relative w-full max-w-md group">
                            <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
                            <div className="relative bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 flex items-center overflow-hidden focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500 transition-all">
                                <div className="pl-6 text-slate-400">
                                    <Search size={22} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher un article..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-4 px-4 text-lg bg-transparent border-none outline-none placeholder:text-slate-400 text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                            {content.blog.categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border",
                                        activeCategory === category
                                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 transform -translate-y-1"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600 hover:bg-slate-50"
                                    )}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- POSTS GRID --- */}
            <section className="container mx-auto px-4 md:px-6 pb-32">
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, index) => (
                            <BlogCard key={post.id} post={post} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-2xl text-slate-400 font-medium">Aucun article trouvé pour cette recherche.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('Tout'); }}
                            className="mt-4 text-brand-600 font-bold hover:underline"
                        >
                            Voir tous les articles
                        </button>
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}
