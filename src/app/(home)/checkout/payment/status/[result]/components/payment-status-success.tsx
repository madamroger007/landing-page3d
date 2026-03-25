import { CheckCircle2 } from "lucide-react";
import PaymentStatusShell from "./payment-status-shell";


export default function PaymentStatusSuccess() {
    return (
        <PaymentStatusShell
            title="Payment Successful"
            subtitle="Check your email for confirmation."
        >
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>

                <p className="text-sm text-green-300">Thank you. Your transaction is completed. </p>
            </div>
        </PaymentStatusShell>
    );
}
