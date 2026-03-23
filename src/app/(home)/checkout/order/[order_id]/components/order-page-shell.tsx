import React from "react";
import CustomCursor from "@/src/components/CustomCursor";

type OrderPageShellProps = {
    children: React.ReactNode;
};

export default function OrderPageShell({ children }: OrderPageShellProps) {
    return (
        <div className="min-h-screen text-white pb-20 bg-dark-bg">
            <CustomCursor />
            {children}
        </div>
    );
}