// src/components/lecturer/CourseDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import lecturerApi from "../../api/lecturerApi";
import type { Course, Chapter, Lesson, Quiz } from "./lecturer.types";
import { LecturerHeader } from "./LecturerHeader";
import { CourseNav } from "./CourseNav";
import { CourseQuizzes } from "./CourseQuizzes";
import { CourseGrading } from "./CourseGrading";
import { CourseReport } from "./CourseReport";
import { ChevronDown, ChevronRight, FileText, ClipboardList, Plus, FileVideo, File, Edit, Trash2, X } from "lucide-react";
import { Button } from "../ui/button";

type User = {
    fullName: string;
    role: string;
    avatar?: string;
};

interface ChapterContent {
    chapterId: string;
    lessons: Lesson[];
    quizzes: Quiz[];
    loading: boolean;
}

const CourseDetailPage = () => {
    const location = useLocation();
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [chapterContents, setChapterContents] = useState<Map<string, ChapterContent>>(new Map());

    // Add Chapter Modal
    const [showAddChapter, setShowAddChapter] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState("");
    const [addingChapter, setAddingChapter] = useState(false);

    // Add/Edit Lesson Modal
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [lessonChapterId, setLessonChapterId] = useState<string>("");
    const [lessonForm, setLessonForm] = useState({
        title: "",
        contentHtml: "",
        fileUrl: "",
        fileType: "",
        durationSeconds: 0
    });
    const [savingLesson, setSavingLesson] = useState(false);

    // Delete Lesson Confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<{ lesson: Lesson, chapterId: string } | null>(null);
    const [deletingLesson, setDeletingLesson] = useState(false);

    // Delete Chapter Confirmation
    const [showDeleteChapterModal, setShowDeleteChapterModal] = useState(false);
    const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
    const [deletingChapter, setDeletingChapter] = useState(false);

    const user: User = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (courseId) {
            loadCourseData();
        }
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            setLoading(true);
            const [courseData, chaptersData] = await Promise.all([
                lecturerApi.getCourseById(courseId!),
                lecturerApi.getChaptersByCourse(courseId!)
            ]);
            setCourse(courseData);
            setChapters(chaptersData);
        } catch (error) {
            console.error("Failed to load course:", error);
            toast.error("Không thể tải khóa học");
        } finally {
            setLoading(false);
        }
    };

    const toggleChapter = async (chapterId: string) => {
        const isExpanded = expandedChapters.has(chapterId);

        setExpandedChapters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chapterId)) {
                newSet.delete(chapterId);
            } else {
                newSet.add(chapterId);
            }
            return newSet;
        });

        // Load content if expanding and not already loaded
        if (!isExpanded && !chapterContents.has(chapterId)) {
            try {
                setChapterContents(prev => new Map(prev).set(chapterId, {
                    chapterId,
                    lessons: [],
                    quizzes: [],
                    loading: true
                }));

                const [lessons, quizzes] = await Promise.all([
                    lecturerApi.getLessonsByChapter(chapterId),
                    lecturerApi.getQuizzesByChapter(chapterId)
                ]);

                setChapterContents(prev => new Map(prev).set(chapterId, {
                    chapterId,
                    lessons,
                    quizzes,
                    loading: false
                }));
            } catch (error) {
                console.error("Failed to load chapter content:", error);
                setChapterContents(prev => new Map(prev).set(chapterId, {
                    chapterId,
                    lessons: [],
                    quizzes: [],
                    loading: false
                }));
            }
        }
    };

    const handleAddChapter = async () => {
        if (!newChapterTitle.trim()) {
            toast.error("Vui lòng nhập tên chương");
            return;
        }

        try {
            setAddingChapter(true);
            await lecturerApi.createChapter({
                courseId: courseId!,
                title: newChapterTitle,
                orderIndex: chapters.length + 1
            });
            toast.success("Thêm chương thành công!");
            setNewChapterTitle("");
            setShowAddChapter(false);
            loadCourseData(); // Reload data
        } catch (error) {
            console.error("Failed to add chapter:", error);
            toast.error("Không thể thêm chương");
        } finally {
            setAddingChapter(false);
        }
    };

    const getFileIcon = (fileType?: string) => {
        if (!fileType) return <File className="w-4 h-4" />;
        if (fileType.includes("video")) return <FileVideo className="w-4 h-4 text-purple-500" />;
        return <FileText className="w-4 h-4 text-blue-500" />;
    };

    const openAddLessonModal = (chapterId: string) => {
        setEditingLesson(null);
        setLessonChapterId(chapterId);
        setLessonForm({
            title: "",
            contentHtml: "",
            fileUrl: "",
            fileType: "",
            durationSeconds: 0
        });
        setShowLessonModal(true);
    };

    const openEditLessonModal = (lesson: Lesson, chapterId: string) => {
        setEditingLesson(lesson);
        setLessonChapterId(chapterId);
        setLessonForm({
            title: lesson.title,
            contentHtml: lesson.contentHtml || "",
            fileUrl: lesson.fileUrl || "",
            fileType: lesson.fileType || "",
            durationSeconds: lesson.durationSeconds || 0
        });
        setShowLessonModal(true);
    };

    const handleSaveLesson = async () => {
        if (!lessonForm.title.trim()) {
            toast.error("Vui lòng nhập tên bài giảng");
            return;
        }

        try {
            setSavingLesson(true);

            if (editingLesson) {
                // Update existing lesson
                await lecturerApi.updateLesson({
                    id: editingLesson.id,
                    title: lessonForm.title,
                    contentHtml: lessonForm.contentHtml,
                    fileUrl: lessonForm.fileUrl,
                    fileType: lessonForm.fileType,
                    durationSeconds: lessonForm.durationSeconds
                });
                toast.success("Cập nhật bài giảng thành công!");
            } else {
                // Create new lesson
                const content = chapterContents.get(lessonChapterId);
                await lecturerApi.createLesson({
                    chapterId: lessonChapterId,
                    title: lessonForm.title,
                    orderIndex: (content?.lessons.length || 0) + 1,
                    contentHtml: lessonForm.contentHtml,
                    fileUrl: lessonForm.fileUrl,
                    fileType: lessonForm.fileType,
                    durationSeconds: lessonForm.durationSeconds
                });
                toast.success("Thêm bài giảng thành công!");
            }

            setShowLessonModal(false);

            // Reload chapter content
            const lessons = await lecturerApi.getLessonsByChapter(lessonChapterId);
            setChapterContents(prev => new Map(prev).set(lessonChapterId, {
                chapterId: lessonChapterId,
                lessons,
                quizzes: prev.get(lessonChapterId)?.quizzes || [],
                loading: false
            }));
            loadCourseData();
        } catch (error) {
            console.error("Failed to save lesson:", error);
            toast.error(editingLesson ? "Không thể cập nhật bài giảng" : "Không thể thêm bài giảng");
        } finally {
            setSavingLesson(false);
        }
    };

    const openDeleteModal = (lesson: Lesson, chapterId: string) => {
        setLessonToDelete({ lesson, chapterId });
        setShowDeleteModal(true);
    };

    const handleDeleteLesson = async () => {
        if (!lessonToDelete) return;

        try {
            setDeletingLesson(true);
            await lecturerApi.deleteLesson(lessonToDelete.lesson.id);
            toast.success("Xóa bài giảng thành công!");

            // Reload chapter content
            const lessons = await lecturerApi.getLessonsByChapter(lessonToDelete.chapterId);
            setChapterContents(prev => new Map(prev).set(lessonToDelete.chapterId, {
                chapterId: lessonToDelete.chapterId,
                lessons,
                quizzes: prev.get(lessonToDelete.chapterId)?.quizzes || [],
                loading: false
            }));
            loadCourseData();
        } catch (error) {
            console.error("Failed to delete lesson:", error);
            toast.error("Không thể xóa bài giảng");
        } finally {
            setDeletingLesson(false);
            setShowDeleteModal(false);
            setLessonToDelete(null);
        }
    };

    const handleDeleteChapter = async () => {
        if (!chapterToDelete) return;

        try {
            setDeletingChapter(true);
            await lecturerApi.deleteChapter(chapterToDelete.id);
            toast.success("Xóa chương thành công!");

            setShowDeleteChapterModal(false);
            setChapterToDelete(null);
            loadCourseData(); // Reload all data
        } catch (error) {
            console.error("Failed to delete chapter:", error);
            toast.error("Không thể xóa chương");
        } finally {
            setDeletingChapter(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Đang tải...</div>;
    }

    if (!course) {
        return <div className="text-center py-12">Không tìm thấy khóa học</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <LecturerHeader user={user} />

            <div className="px-6 py-6 max-w-7xl mx-auto">
                <CourseNav courseName={course.name} />

                {location.pathname.endsWith("/quizzes") ? (
                    <CourseQuizzes />
                ) : location.pathname.endsWith("/grading") ? (
                    <CourseGrading />
                ) : location.pathname.endsWith("/report") ? (
                    <CourseReport />
                ) : (
                    <>
                        {/* Course Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                                    <p className="text-gray-500 mt-1">
                                        {course.courseCode} - {course.semesterName} - {course.academicYearName ?? ""}
                                    </p>
                                </div>
                                <Button variant="outline" onClick={() => setShowAddChapter(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm chương
                                </Button>
                            </div>

                            {/* Stats - Horizontal Row */}
                            <div className="flex gap-6">
                                <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">{course.totalStudents}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">Sinh viên</span>
                                </div>
                                <div className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 font-bold">{course.totalChapters}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">Chương</span>
                                </div>
                                <div className="flex items-center gap-3 bg-purple-50 rounded-lg px-4 py-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 font-bold">{course.totalLessons}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">Bài giảng</span>
                                </div>
                                <div className="flex items-center gap-3 bg-orange-50 rounded-lg px-4 py-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <span className="text-orange-600 font-bold">{course.totalQuizzes}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">Bài kiểm tra</span>
                                </div>
                            </div>
                        </div>

                        {/* Chapters List */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Nội dung khóa học</h2>
                            </div>

                            {chapters.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Chưa có chương nào. Bấm "Thêm chương" để bắt đầu.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chapters.map((chapter, index) => {
                                        const content = chapterContents.get(chapter.id);
                                        const isExpanded = expandedChapters.has(chapter.id);

                                        return (
                                            <div key={chapter.id} className="border rounded-lg overflow-hidden">
                                                <div
                                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                                                    onClick={() => toggleChapter(chapter.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                                        )}
                                                        <span className="font-medium">
                                                            Chương {index + 1}: {chapter.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="w-4 h-4" />
                                                            {chapter.totalLessons} bài giảng
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ClipboardList className="w-4 h-4" />
                                                            {chapter.totalQuizzes} bài kiểm tra
                                                        </span>
                                                        <button
                                                            className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition ml-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setChapterToDelete(chapter);
                                                                setShowDeleteChapterModal(true);
                                                            }}
                                                            title="Xóa chương"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="border-t bg-gray-50">
                                                        {content?.loading ? (
                                                            <div className="p-4 text-center text-gray-500">
                                                                Đang tải nội dung...
                                                            </div>
                                                        ) : content?.lessons && content.lessons.length > 0 ? (
                                                            <div className="divide-y">
                                                                {content.lessons.map((lesson, lessonIndex) => (
                                                                    <div key={lesson.id} className="flex items-center justify-between p-3 px-6 hover:bg-gray-100 transition">
                                                                        <div className="flex items-center gap-3">
                                                                            {getFileIcon(lesson.fileType)}
                                                                            <span className="text-sm">
                                                                                {lessonIndex + 1}. {lesson.title}
                                                                            </span>
                                                                            {lesson.durationSeconds > 0 && (
                                                                                <span className="text-xs text-gray-400">
                                                                                    ({Math.floor(lesson.durationSeconds / 60)} phút)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button variant="ghost" size="sm" onClick={() => openEditLessonModal(lesson, chapter.id)}>
                                                                                <Edit className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => openDeleteModal(lesson, chapter.id)}>
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 text-center text-gray-500">
                                                                Chưa có bài giảng nào trong chương này.
                                                            </div>
                                                        )}

                                                        {/* Quizzes List */}
                                                        {content?.quizzes && content.quizzes.length > 0 && (
                                                            <div className="divide-y border-t border-gray-100">
                                                                {content.quizzes.map((quiz, quizIndex) => (
                                                                    <div key={quiz.id} className="flex items-center justify-between p-3 px-6 hover:bg-gray-100 transition">
                                                                        <div className="flex items-center gap-3">
                                                                            <ClipboardList className="w-4 h-4 text-orange-500" />
                                                                            <span className="text-sm">
                                                                                Bài kiểm tra: {quiz.title}
                                                                            </span>
                                                                            {quiz.timeLimit && (
                                                                                <span className="text-xs text-gray-400">
                                                                                    ({quiz.timeLimit} phút)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Add Lesson Button */}
                                                        <div className="p-3 px-6 border-t">
                                                            <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => openAddLessonModal(chapter.id)}>
                                                                <Plus className="w-4 h-4 mr-1" />
                                                                Thêm bài giảng
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Add Chapter Modal */}
            {showAddChapter && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Thêm chương mới</h3>
                            <button onClick={() => setShowAddChapter(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên chương
                            </label>
                            <input
                                type="text"
                                value={newChapterTitle}
                                onChange={(e) => setNewChapterTitle(e.target.value)}
                                placeholder="Nhập tên chương..."
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                onKeyDown={(e) => e.key === "Enter" && handleAddChapter()}
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setShowAddChapter(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleAddChapter} disabled={addingChapter}>
                                {addingChapter ? "Đang thêm..." : "Thêm chương"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Lesson Modal */}
            {showLessonModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editingLesson ? "Sửa bài giảng" : "Thêm bài giảng mới"}
                            </h3>
                            <button onClick={() => setShowLessonModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên bài giảng *
                                </label>
                                <input
                                    type="text"
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Nhập tên bài giảng..."
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* Content HTML */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nội dung bài giảng
                                </label>
                                <textarea
                                    value={lessonForm.contentHtml}
                                    onChange={(e) => setLessonForm(prev => ({ ...prev, contentHtml: e.target.value }))}
                                    placeholder="Nhập nội dung bài giảng..."
                                    rows={4}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                />
                            </div>

                            {/* File URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL file/video (tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    value={lessonForm.fileUrl}
                                    onChange={(e) => setLessonForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                                    placeholder="https://example.com/video.mp4"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* File Type and Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại file
                                    </label>
                                    <select
                                        value={lessonForm.fileType}
                                        onChange={(e) => setLessonForm(prev => ({ ...prev, fileType: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Chọn loại</option>
                                        <option value="video/mp4">Video</option>
                                        <option value="application/pdf">PDF</option>
                                        <option value="text/html">Văn bản</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Thời lượng (phút)
                                    </label>
                                    <input
                                        type="number"
                                        value={Math.floor(lessonForm.durationSeconds / 60)}
                                        onChange={(e) => setLessonForm(prev => ({ ...prev, durationSeconds: parseInt(e.target.value) * 60 || 0 }))}
                                        min={0}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                            {editingLesson && (
                                <Button
                                    variant="ghost"
                                    className="mr-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        setShowLessonModal(false);
                                        openDeleteModal(editingLesson, lessonChapterId);
                                    }}
                                >
                                    Xóa
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setShowLessonModal(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleSaveLesson} disabled={savingLesson}>
                                {savingLesson ? "Đang lưu..." : (editingLesson ? "Cập nhật" : "Thêm bài giảng")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa bài giảng "{lessonToDelete?.lesson.title}" không? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, minWidth: '80px' }}
                                onClick={handleDeleteLesson}
                                disabled={deletingLesson}
                            >
                                {deletingLesson ? "Đang xóa..." : "Xóa ngay"}
                            </button>
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Chapter Confirmation Modal */}
            {showDeleteChapterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">Xác nhận xóa chương</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa chương "{chapterToDelete?.title}" không?
                            <br />
                            <span className="text-sm text-red-500 mt-2 block">
                                Lưu ý: Bạn chỉ có thể xóa chương khi chương không chứa bài học nào.
                            </span>
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, minWidth: '80px' }}
                                onClick={handleDeleteChapter}
                                disabled={deletingChapter}
                            >
                                {deletingChapter ? "Đang xóa..." : "Xóa ngay"}
                            </button>
                            <Button variant="outline" onClick={() => setShowDeleteChapterModal(false)}>
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetailPage;
