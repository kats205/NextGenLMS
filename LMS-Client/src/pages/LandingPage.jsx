import React, { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, BarChart3, Shield, ArrowRight, CheckCircle, Play, Bell, Search, Star, MoreVertical, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHealthy } from '../services/getHealthy.jsx';

const LandingPage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        healthy();
    }, []);

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const dashboardContainer = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.5,
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const healthy = async () => {
        try {
            const response = await getHealthy();
            console.log("Healthy response:", response);
        } catch (error) {
            console.log("Error fetching healthy status:", error);
        }
    }
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 15 }}
                                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20"
                            >
                                <BookOpen className="text-white w-6 h-6" />
                            </motion.div>
                            <span className="text-2xl font-extrabold tracking-tight text-slate-900">NextGen<span className="text-blue-600">LMS</span></span>
                        </div>
                        
                        <div className="hidden md:flex space-x-10">
                            {['Tính năng', 'Về chúng tôi', 'Cộng đồng', 'Liên hệ'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} className="text-slate-600 hover:text-blue-600 font-medium transition-colors relative group">
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/40 flex items-center group"
                            >
                                Đăng nhập
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Rebooted for Lightness & Performance */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
                {/* Static Background Gradients - Zero JS Override */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 -z-10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs mb-8 tracking-wide uppercase">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                LMS 2.0 is Live
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900">
                                Đơn giản hóa <br className="hidden lg:block" />
                                <span className="text-blue-600">Quản lý Giáo dục</span>
                            </h1>

                            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                                Nền tảng LMS hiện đại, nhanh chóng và dễ sử dụng. Tập trung vào trải nghiệm người dùng và hiệu suất vượt trội.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-600/20">
                                    Bắt đầu ngay
                                </button>
                                <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center">
                                    <Play className="w-5 h-5 mr-2 fill-current" /> Demo
                                </button>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-slate-500 font-medium border-t border-slate-200 pt-8">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} alt="User" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex text-yellow-500 mb-0.5">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                                    </div>
                                    <span className="opacity-80">Được tin dùng bởi 100+ tổ chức</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Panel - Rebooted: Clean, Static, Fast */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="hidden lg:block relative"
                        >
                            <div className="relative z-10 bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-8">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900">Dashboard</h3>
                                        <p className="text-slate-500 text-sm">Chào mừng quay trở lại!</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Settings size={20} />
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Large Progress Card */}
                                    <div className="col-span-2 bg-blue-50 rounded-2xl p-6 relative overflow-hidden group hover:bg-blue-100/50 transition-colors">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                                    <BookOpen size={20} />
                                                </div>
                                                <span className="bg-white text-blue-700 text-xs font-bold px-2 py-1 rounded">85%</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-1">UI/UX Design Masterclass</h4>
                                            <p className="text-slate-500 text-sm mb-4">Tiếp tục bài học: Prototyping</p>
                                            <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 w-[85%] rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stat Card 1 */}
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Giờ học</div>
                                        <div className="text-3xl font-extrabold text-slate-900 mb-1">124h</div>
                                        <div className="text-green-500 text-xs font-medium flex items-center gap-1">
                                            <ArrowRight className="w-3 h-3 -rotate-45" /> +12% tuần này
                                        </div>
                                    </div>

                                    {/* Stat Card 2 */}
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Chứng chỉ</div>
                                        <div className="text-3xl font-extrabold text-slate-900 mb-1">4</div>
                                        <div className="text-slate-400 text-xs font-medium">Đã đạt được</div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative element behind */}
                            <div className="absolute top-10 -right-10 w-full h-full bg-slate-100 rounded-3xl -z-10 transform rotate-3"></div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-600/10 pattern-dots"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                        {[
                            { number: "50K+", label: "Sinh viên", icon: <Users className="w-6 h-6 mb-2 mx-auto text-blue-400" /> },
                            { number: "120+", label: "Đối tác trường ĐH", icon: <BookOpen className="w-6 h-6 mb-2 mx-auto text-blue-400" /> },
                            { number: "1M+", label: "Tài liệu học tập", icon: <BarChart3 className="w-6 h-6 mb-2 mx-auto text-blue-400" /> },
                            { number: "#1", label: "Tại Việt Nam", icon: <Star className="w-6 h-6 mb-2 mx-auto text-blue-400" /> },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="p-4"
                            >
                                {stat.icon}
                                <div className="text-4xl lg:text-5xl font-extrabold mb-1 tracking-tight">{stat.number}</div>
                                <div className="text-slate-400 font-medium text-sm uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Tính năng cốt lõi</span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Mọi thứ bạn cần để vận hành</h2>
                        <p className="text-xl text-slate-600">Bộ công cụ toàn diện giúp chuyển đổi số quy trình đào tạo của bạn.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <BookOpen className="w-6 h-6" />,
                                title: "Quản lý khóa học thông minh",
                                desc: "Xây dựng lộ trình học tập, quản lý tài liệu và bài giảng với giao diện kéo thả trực quan."
                            },
                            {
                                icon: <BarChart3 className="w-6 h-6" />,
                                title: "Analytics & Báo cáo",
                                desc: "Hệ thống báo cáo chi tiết giúp theo dõi hiệu suất học tập và giảng dạy theo thời gian thực."
                            },
                            {
                                icon: <Users className="w-6 h-6" />,
                                title: "Tương tác đa chiều",
                                desc: "Tích hợp Video Call, Chat nhóm và bảng trắng tương tác giúp lớp học trực tuyến sống động."
                            },
                            {
                                icon: <Shield className="w-6 h-6" />,
                                title: "Bảo mật chuẩn Quốc tế",
                                desc: "Dữ liệu được mã hóa 256-bit, tuân thủ các tiêu chuẩn bảo mật giáo dục khắt khe nhất."
                            },
                            {
                                icon: <Play className="w-6 h-6" />,
                                title: "Hỗ trợ đa phương tiện",
                                desc: "Player HTML5 mạnh mẽ hỗ trợ Video 4K, SCORM, bài giảng tương tác H5P mượt mà."
                            },
                            {
                                icon: <CheckCircle className="w-6 h-6" />,
                                title: "Đánh giá tự động",
                                desc: "Tạo đề thi trắc nghiệm, tự luận với hệ thống chấm điểm và phản hồi tự động AI."
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -10 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-blue-100/50 hover:bg-white transition-all group cursor-default"
                            >
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-md border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-[2.5rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20"
                    >
                        {/* Background design */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-8">Sẵn sàng chuyển đổi số?</h2>
                            <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                                Tham gia cùng cộng đồng các trường đại học hàng đầu và trải nghiệm nền tảng quản lý học tập thế hệ mới ngay hôm nay.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-5 rounded-full font-bold text-lg transition-colors shadow-lg shadow-black/10">
                                    Đăng ký dùng thử miễn phí
                                </button>
                                <button className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-10 py-5 rounded-full font-bold text-lg transition-all">
                                    Liên hệ tư vấn
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800 font-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="flex items-center mb-6">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                                    <BookOpen className="text-white w-5 h-5" />
                                </div>
                                <span className="text-xl font-bold text-white">NextGenLMS</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed mb-6 pr-4">
                                Định hình lại tương lai giáo dục thông qua công nghệ. Chúng tôi cam kết mang đến giải pháp LMS tốt nhất cho trường học và doanh nghiệp.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-lg">Sản phẩm</h4>
                            <ul className="space-y-4">
                                {['Tính năng', 'Bảng giá', 'Showcase', 'Cập nhật', 'API'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-white hover:pl-2 transition-all duration-300">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-lg">Hỗ trợ</h4>
                            <ul className="space-y-4">
                                {['Tài liệu', 'Hướng dẫn', 'Trạng thái hệ thống', 'Cộng đồng', 'Liên hệ Support'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-white hover:pl-2 transition-all duration-300">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-lg">Pháp lý</h4>
                            <ul className="space-y-4">
                                {['Điều khoản sử dụng', 'Chính sách bảo mật', 'Cookies', 'Bản quyền'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-white hover:pl-2 transition-all duration-300">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                        <p>&copy; 2025 NextGenLMS Corporation.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Facebook</a>
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
