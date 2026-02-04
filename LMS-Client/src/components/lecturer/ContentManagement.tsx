// src/components/lecturer/ContentManagement.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import lecturerApi from '../../api/lecturerApi';
import type { Chapter, Lesson, Quiz } from './lecturer.types';

interface ContentManagementProps {
    courseId: string;
}

interface ContentItem {
    id: string;
    title: string;
    type: 'Lesson' | 'Quiz' | 'Announcement';
    chapterName: string;
    date: string;
    views: number;
    icon: string;
    iconBg: string;
}

const ContentManagement: React.FC<ContentManagementProps> = ({ courseId }) => {
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse] = useState('Lập trình Web (IT301)');

    useEffect(() => {
        loadContents();
    }, [courseId]);

    const loadContents = async () => {
        try {
            setLoading(true);

            // Load chapters first
            const chapters = await lecturerApi.getChaptersByCourse(courseId);

            // Load lessons and quizzes for each chapter
            const allContents: ContentItem[] = [];

            for (const chapter of chapters) {
                try {
                    // Load lessons
                    const lessons = await lecturerApi.getLessonsByChapter(chapter.id);
                    lessons.forEach((lesson: Lesson) => {
                        allContents.push({
                            id: lesson.id,
                            title: lesson.title,
                            type: 'Lesson',
                            chapterName: chapter.title,
                            date: new Date(lesson.createdAt).toISOString().split('T')[0],
                            views: lesson.totalViews || 0,
                            icon: lesson.fileType === 'Video' ? '🎥' : '📄',
                            iconBg: 'bg-purple-100'
                        });
                    });

                    // Load quizzes
                    const quizzes = await lecturerApi.getQuizzesByChapter(chapter.id);
                    quizzes.forEach((quiz: Quiz) => {
                        allContents.push({
                            id: quiz.id,
                            title: quiz.title,
                            type: 'Quiz',
                            chapterName: chapter.title,
                            date: new Date(quiz.createdAt).toISOString().split('T')[0],
                            views: 0,
                            icon: '📝',
                            iconBg: 'bg-blue-100'
                        });
                    });
                } catch (error) {
                    console.error(`Failed to load content for chapter ${chapter.id}:`, error);
                }
            }

            // Sort by date descending
            allContents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setContents(allContents);
        } catch (error: any) {
            console.error('Failed to load contents:', error);
            toast.error('Không thể tải danh sách nội dung');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (contentId: string) => {
        toast.info('Chức năng chỉnh sửa đang được phát triển');
    };

    const handleView = (contentId: string) => {
        toast.info('Chức năng xem chi tiết đang được phát triển');
    };

    const handleDelete = async (contentId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa nội dung này?')) return;

        try {
            // Determine if it's a lesson or quiz and call appropriate API
            const content = contents.find(c => c.id === contentId);
            if (content?.type === 'Lesson') {
                await lecturerApi.deleteLesson(contentId);
            } else if (content?.type === 'Quiz') {
                await lecturerApi.deleteQuiz(contentId);
            }

            toast.success('Xóa nội dung thành công');
            loadContents(); // Reload
        } catch (error: any) {
            console.error('Failed to delete content:', error);
            toast.error('Không thể xóa nội dung');
        }
    };

    const handleAddLesson = () => {
        toast.info('Modal thêm bài giảng sẽ được hiển thị ở đây');
    };

    const handleAddAnnouncement = () => {
        toast.info('Modal thêm thông báo sẽ được hiển thị ở đây');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <select
                    value={selectedCourse}
                    disabled
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option>{selectedCourse}</option>
                </select>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleAddLesson}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <span>+</span>
                        <span>Thêm bài giảng</span>
                    </button>
                    <button
                        onClick={handleAddAnnouncement}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <span>+</span>
                        <span>Thêm thông báo</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {contents.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Chưa có nội dung nào</p>
                        <button
                            onClick={handleAddLesson}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Thêm nội dung đầu tiên
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NỘI DUNG</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CHƯƠNG</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NGÀY ĐĂNG</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LƯỢT XEM</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {contents.map((content) => (
                                <ContentRow
                                    key={content.id}
                                    content={content}
                                    onEdit={handleEdit}
                                    onView={handleView}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

interface ContentRowProps {
    content: ContentItem;
    onEdit: (id: string) => void;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
}

const ContentRow: React.FC<ContentRowProps> = ({ content, onEdit, onView, onDelete }) => (
    <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
            <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${content.iconBg} rounded-lg flex items-center justify-center`}>
                    <span className="text-xl">{content.icon}</span>
                </div>
                <div>
                    <div className="font-medium text-gray-900">{content.title}</div>
                    <div className="text-sm text-gray-500">
                        {content.type === 'Lesson' ? 'Bài giảng' : content.type === 'Quiz' ? 'Bài kiểm tra' : 'Thông báo'}
                    </div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">{content.chapterName}</td>
        <td className="px-6 py-4 text-sm text-gray-600">{content.date}</td>
        <td className="px-6 py-4 text-sm text-gray-600">{content.views}</td>
        <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onEdit(content.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Chỉnh sửa"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button
                    onClick={() => onView(content.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Xem"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
                <button
                    onClick={() => onDelete(content.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Xóa"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </td>
    </tr>
);

export default ContentManagement;