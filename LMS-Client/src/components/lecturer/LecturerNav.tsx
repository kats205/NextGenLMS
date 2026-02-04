import { Link, useLocation } from "react-router-dom";

export function LecturerNav() {
    const location = useLocation();

    // chỉ hiển thị menu đầy đủ khi đang ở trang course detail
    const isCourseDetailPage = location.pathname.startsWith("/lecturer/courses/");

    return (
        <div className="bg-white rounded-xl shadow mb-6 px-4 py-3">
            <div className="flex gap-2">

                {/* TAB KHÓA HỌC (luôn luôn hiển thị và là link) */}
                <Link
                    to="/lecturer/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${location.pathname === "/lecturer/dashboard" ||
                            location.pathname.startsWith("/lecturer/courses/")
                            ? "bg-primary-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    Khóa học của tôi
                </Link>

                {/* 4 TAB CHỈ HIỂN THỊ KHI Ở TRANG COURSE DETAIL */}
                {isCourseDetailPage && (
                    <>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                            Quản lý nội dung
                        </button>

                        <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                            Bài kiểm tra
                        </button>

                        <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                            Chấm bài
                        </button>

                        <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                            Báo cáo lớp
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}