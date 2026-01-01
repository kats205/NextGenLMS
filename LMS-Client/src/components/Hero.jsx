import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';

const Hero = () => {
    return (
        <section className="pt-32 pb-20 px-6 relative overflow-hidden">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex-1"
                    >
                        <h1 className="text-5xl lg:text-7xl font-bold text-dark leading-tight mb-6">
                            Empower Your <span className="text-primary">Learning</span> Journey
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-xl">
                            NextGenLMS provides a modern, intuitive, and powerful platform for seamless education management and student engagement.
                        </p>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full text-lg hover:bg-primary/90 transition-transform hover:scale-105 shadow-xl shadow-primary/30">
                                Start Free Trial <ArrowRight size={20} />
                            </button>
                            <button className="px-8 py-4 rounded-full text-lg border border-gray-200 hover:border-primary hover:text-primary transition-colors bg-white">
                                View Demo
                            </button>
                        </div>

                        <div className="mt-12 flex gap-8">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 p-2 rounded-full text-primary">
                                    <Users size={20} />
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold block text-dark">10k+</span>
                                    <span className="text-gray-500">Students</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-amber-100 p-2 rounded-full text-accent">
                                    <BookOpen size={20} />
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold block text-dark">500+</span>
                                    <span className="text-gray-500">Courses</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-1 relative"
                    >
                        <div className="relative z-10 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100">
                            <img
                                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Dashboard Preview"
                                className="rounded-xl w-full"
                            />

                            {/* Floating Card 1 */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="absolute -left-8 top-20 bg-white p-4 rounded-xl shadow-lg border border-gray-50 flex items-center gap-3"
                            >
                                <div className="bg-green-100 p-2 rounded-full text-green-600">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Course Completed</p>
                                    <p className="font-bold text-dark">Web Design 101</p>
                                </div>
                            </motion.div>

                            {/* Floating Card 2 */}
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, delay: 1 }}
                                className="absolute -right-8 bottom-20 bg-white p-4 rounded-xl shadow-lg border border-gray-50 max-w-[200px]"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <img src="https://i.pravatar.cc/100?img=33" className="w-8 h-8 rounded-full" alt="Avatar" />
                                    <div>
                                        <p className="text-xs font-bold text-dark">Dr. Sarah</p>
                                        <p className="text-[10px] text-gray-500">Instructor</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600">"Great progress on your final project!"</p>
                            </motion.div>
                        </div>

                        {/* Background Blobs */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10 transform translate-x-20 -translate-y-20"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -z-10 transform -translate-x-10 translate-y-10"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
