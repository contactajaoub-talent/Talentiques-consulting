'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { content } from '@/lib/content';

export const WhatsAppButton = () => {
    // Format number for WhatsApp link (remove spaces/symbols)
    const phone = content.contact.whatsapp.replace(/[^0-9]/g, '');

    return (
        <motion.a
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[999] group"
        >
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping group-hover:opacity-100 transition-opacity" />
            <div className="relative w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl shadow-[#25D366]/40 transition-transform">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="-ml-[2px] mt-[1px]">
                    <path d="M17.472 14.382C17.119 14.205 15.42 13.382 15.101 13.276C14.783 13.169 14.549 13.118 14.322 13.435C14.076 13.754 13.385 14.545 13.153 14.776C12.923 15.006 12.71 15.043 12.356 14.865C12.003 14.689 10.864 14.318 9.516 13.116C8.455 12.17 7.739 10.999 7.525 10.647C7.314 10.292 7.502 10.125 7.682 9.929C7.838 9.771 8.03 9.514 8.204 9.303C8.384 9.091 8.441 8.951 8.56 8.705C8.679 8.459 8.621 8.246 8.533 8.069C8.443 7.893 7.737 6.166 7.438 5.46C7.151 4.773 6.852 4.869 6.643 4.869C6.444 4.869 6.216 4.869 5.989 4.869C5.76 4.869 5.393 4.956 5.074 5.305C4.757 5.658 3.876 6.471 3.876 8.16C3.876 9.85 5.111 11.472 5.286 11.716C5.464 11.966 7.734 15.584 11.299 16.992C14.128 18.109 14.722 17.915 15.342 17.809C16.32 17.632 17.848 16.822 18.166 15.939C18.481 15.056 18.481 14.298 18.396 14.156C18.307 14.017 18.077 13.929 17.472 13.754V14.382ZM11.996 24C9.916 23.999 7.892 23.475 6.104 22.477L5.723 22.25L1.31901 23.414L2.49399 19.125L2.247 18.729C1.196 17.065 0.636 15.152 0.636 13.185C0.636 6.942 5.733 1.862 12.006 1.862C15.039 1.862 17.89 3.045 20.035 5.191C22.181 7.337 23.364 10.191 23.364 13.235C23.364 19.479 18.267 24.558 11.996 24Z" />
                </svg>
            </div>
        </motion.a>
    );
};
