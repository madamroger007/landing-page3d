import Link from "next/link";

export default function OrderNotFoundState() {
    return (
        <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center px-6 text-center">
            <div>
                <p className="text-white/70">Order not found in local data.</p>
                <Link href="/checkout/" className="text-cyan-300 hover:underline text-sm mt-4 inline-block">
                    Back to all orders
                </Link>
            </div>
        </div>
    );
}