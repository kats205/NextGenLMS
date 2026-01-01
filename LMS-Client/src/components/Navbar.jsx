import React from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
        >
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">NextGenLMS</span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-gray-600 hover:text-primary transition-colors">Features</a>
                    <a href="#" className="text-gray-600 hover:text-primary transition-colors">Solutions</a>
                    <a href="#" className="text-gray-600 hover:text-primary transition-colors">Pricing</a>
                    <a href="#" className="text-gray-600 hover:text-primary transition-colors">Contact</a>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-primary font-medium hover:text-primary/80">Login</button>
                    <button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                        Get Started
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
