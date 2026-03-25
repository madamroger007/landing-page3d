import { AlertTriangle } from "lucide-react";
import PaymentStatusShell from "./payment-status-shell";
import Link from "next/link";

export default function PaymentStatusError() {

    return (
        <PaymentStatusShell
            title="Payment Failed"
            subtitle="We could not confirm your payment. Please try again later."
        >
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                <p className="text-sm text-red-300">No payment was confirmed for this transaction.</p>
                <Link
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/products/`}
                    className="text-gray-100 hover:underline text-sm mt-4 inline-block bg-blue-500/20 px-4 py-2 rounded-lg hover:bg-blue-300/30"
                >
                    Try again
                </Link>
            </div>
        </PaymentStatusShell>
    );
}
