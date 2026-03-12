
// ─── Error Display ───────────────────────────────────────────────────────────

export default function ErrorDisplay({ message }: { message: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md">
                {message}
            </div>
        </div>
    );
}