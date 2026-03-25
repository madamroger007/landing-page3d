import React from "react";
import CustomCursor from "@/src/components/CustomCursor";

type PaymentStatusShellProps = {
    title: string;
    subtitle: string;
    children?: React.ReactNode;
};

export default function PaymentStatusShell({ title, subtitle, children }: PaymentStatusShellProps) {
    return (
        <div className="min-h-screen text-white bg-dark-bg flex items-center justify-center px-6">
            <CustomCursor />

            <div className="max-w-3xl w-full">
                <div
                    className="rounded-[32px] overflow-hidden p-8 md:p-12"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.01)",
                        boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
                    }}
                >
                    <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-bold mb-3">Payment Status</p>
                    <h1 className="text-3xl md:text-4xl font-syne font-bold mb-3">{title}</h1>
                    <p className="text-white/70 text-sm md:text-base">{subtitle}</p>

                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
