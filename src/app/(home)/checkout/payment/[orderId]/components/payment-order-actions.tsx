import Link from "next/link";
import { CheckCircle2, RefreshCcw } from "lucide-react";

type PaymentOrderActionsProps = {
    orderId: string;
    isSuccess: boolean;
    checkingStatus: boolean;
    onCheckStatus: () => void;
    statusMessage: string;
};

export default function PaymentOrderActions({
    orderId,
    isSuccess,
    checkingStatus,
    onCheckStatus,
    statusMessage,
}: PaymentOrderActionsProps) {
    return (
        <>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                    <p className="text-[10px] text-left text-white/30 uppercase font-black mb-1">Invoice Number</p>
                    <p className="text-xs font-mono text-white/60">{orderId}</p>
                </div>
            </div>

            {!isSuccess && (
                <button
                    type="button"
                    onClick={onCheckStatus}
                    disabled={checkingStatus}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${checkingStatus ? "animate-spin" : ""}`} />
                    {checkingStatus ? "Checking..." : "Check Payment Status"}
                </button>
            )}

            {statusMessage && <p className="text-xs text-white/50">{statusMessage}</p>}

            {!isSuccess ? (
                <p className="text-sm text-white/50 py-5">
                    Complete your payment using the instructions above, then refresh this page to see status changes.
                </p>
            ) : (
                <div className="py-5 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-syne font-bold text-green-400">Payment Complete</h3>
                    <p className="text-sm text-white/40">Check your email for confirmation!</p>
                    <Link
                        href="/products"
                        className="mt-4 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all"
                    >
                        Back to Marketplace
                    </Link>
                </div>
            )}
        </>
    );
}
