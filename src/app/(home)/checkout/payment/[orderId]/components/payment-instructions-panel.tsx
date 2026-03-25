import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PaymentDisplayData } from "./payment-utils";
import { Check, Copy } from "lucide-react";

type PaymentInstructionsPanelProps = {
    isSuccess: boolean;
    instructions: string;
    displayData: PaymentDisplayData;
    store?: string;
    copied: boolean;
    onCopy: (value: string) => void;
};

export default function PaymentInstructionsPanel({
    isSuccess,
    instructions,
    displayData,
    store,
    copied,
    onCopy,
}: PaymentInstructionsPanelProps) {
    if (isSuccess) {
        return null;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-6"
            >
                <p className="text-[10px] text-white/40 uppercase font-black mb-4">Payment Instructions</p>
                <p className="text-xs text-white/60 mb-6">{instructions}</p>

                {displayData.shouldShowQris && displayData.qrisUrl && (
                    <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">QRIS</p>
                        <div className="mx-auto w-52 h-52 bg-white rounded-2xl overflow-hidden p-3">
                            <Image
                                unoptimized
                                src={displayData.qrisUrl}
                                alt="QRIS code"
                                width={208}
                                height={208}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                )}

                {displayData.shouldShowVa && (
                    <div className="space-y-3 text-left">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Virtual Account Details</p>
                        {displayData.hasVaList &&
                            displayData.vaNumbers.map((va, idx) => (
                                <div
                                    key={`${va.bank}-${idx}`}
                                    className="p-3 rounded-xl bg-black/40 border border-white/10 flex justify-between items-center gap-3"
                                >
                                    <span className="text-white/60 text-xs uppercase">{va.bank}</span>
                                    <span className="font-mono text-neon-blue text-sm">{va.va_number}</span>
                                    <button
                                        type="button"
                                        onClick={() => onCopy(va.va_number)}
                                        className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/30" />}
                                    </button>
                                </div>
                            ))}
                        {!displayData.hasVaList && displayData.singleVa && (
                            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex justify-between items-center gap-3">
                                <span className="text-white/60 text-xs uppercase">{displayData.paymentName || 'Account Number'}</span>
                                <span className="font-mono text-neon-blue text-sm">{displayData.paymentVa || displayData.singleVa}</span>
                            </div>
                        )}
                        {displayData.billerCode && displayData.billKey && (
                            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/60">Biller Code</span>
                                    <span className="font-mono text-neon-blue">{displayData.billerCode}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/60">Bill Key</span>
                                    <span className="font-mono text-neon-blue">{displayData.billKey}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {displayData.shouldShowStorePayment && displayData.paymentCode && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-left">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Payment Code</p>
                        <div className="flex justify-between text-xs">
                            <span className="text-white/60">Store</span>
                            <span className="text-neon-blue uppercase">{store || "Convenience Store"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-white/60">Code</span>
                            <span className="font-mono text-neon-blue">{displayData.paymentCode}</span>
                        </div>
                    </div>
                )}

                {displayData.shouldShowCard && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-left">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Card Payment Details</p>
                        {displayData.maskedCard && (
                            <div className="flex justify-between text-xs">
                                <span className="text-white/60">Card Number</span>
                                <span className="font-mono text-neon-blue">{displayData.maskedCard}</span>
                            </div>
                        )}
                        {displayData.cardType && (
                            <div className="flex justify-between text-xs">
                                <span className="text-white/60">Card Type</span>
                                <span className="text-neon-blue uppercase">{displayData.cardType}</span>
                            </div>
                        )}
                        {displayData.cardBank && (
                            <div className="flex justify-between text-xs">
                                <span className="text-white/60">Bank</span>
                                <span className="text-neon-blue uppercase">{displayData.cardBank}</span>
                            </div>
                        )}

                        {displayData.cardRedirectUrl && (
                            <Link
                                href={displayData.cardRedirectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center w-full py-2 rounded-lg bg-neon-blue/20 border border-neon-blue/40 text-neon-blue text-xs font-bold"
                            >
                                Complete 3DS Authentication
                            </Link>
                        )}
                    </div>
                )}

                {displayData.shouldShowWallet && displayData.deeplinkUrl && (
                    <Link
                        href={displayData.deeplinkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-neon-blue/20 border border-neon-blue/40 text-neon-blue font-bold text-sm"
                    >
                        Open Wallet Payment
                    </Link>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
