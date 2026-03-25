import Link from "next/link";

type PaymentNotFoundStateProps = {
    message?: string;
};

export default function PaymentNotFoundState({ message }: PaymentNotFoundStateProps) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white px-6 text-center">
            <p className="text-white/70">{message || "Order not found."}</p>
            <Link href="/checkout/" className="text-cyan-300 hover:underline text-sm">
                Back to checkout orders
            </Link>
        </div>
    );
}
