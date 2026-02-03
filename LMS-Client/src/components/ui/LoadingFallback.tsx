export const LoadingFallback = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600"></div>
                <p className="text-sm font-medium text-gray-500">Loading application...</p>
            </div>
        </div>
    );
};
