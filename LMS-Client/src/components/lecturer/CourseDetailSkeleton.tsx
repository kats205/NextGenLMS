import { Skeleton } from "../ui/skeleton";

export const CourseDetailSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-9 w-24 rounded-lg" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
                {/* Navigation Skeleton */}
                <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Course Info Card Skeleton */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-96" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-10 w-36 rounded-lg" />
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-8" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chapters List Skeleton */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-6 w-48" />
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg overflow-hidden">
                                <div className="p-4 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-5 h-5 rounded-md" />
                                        <Skeleton className="h-5 w-64" />
                                    </div>
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
