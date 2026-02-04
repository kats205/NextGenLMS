import { Link, useLocation } from "react-router-dom";

export function LecturerNav() {
    const location = useLocation();

    // ch? hi?n th? menu ??y ?? khi ?ang ? trang course detail
    const isCourseDetailPage = location.pathname.startsWith("/lecturer/courses/");

    return (
        <div className="bg-white rounded-xl shadow mb-6 px-4 py-3">
            <div className="flex gap-2">

                {/* TAB KHÓA H?C (luôn luôn hi?n và là link) */}
                <Link
                    to="/lecturer/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${location.pathname === "/lecturer/dashboard" ||
                            location.pathname.startsWith("/lecturer/courses/")
                            ? "bg-primary-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    Khóa h?c c?a tôi
                </Link>

                {/* 4 TAB CH? HI?N KHI ? COURSE DETAIL */}
                {isCourseDetailPage && (
                    <>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                            Qu?n lý n?i dung
                        </button>

                        <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                            Bài ki?m tra
                        </button>

                        <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                            Ch?m bài
                        </button>

                        <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                            Báo cáo l?p
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}