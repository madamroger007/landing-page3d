import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type CheckoutOrderHeaderProps = {
    eyebrow: string;
    title: string;
    backHref: string;
    backLabel: string;
    titleClassName?: string;
};

export default function CheckoutOrderHeader({
    eyebrow,
    title,
    backHref,
    backLabel,
    titleClassName,
}: CheckoutOrderHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-white/50 text-xs uppercase tracking-[0.3em]">{eyebrow}</p>
                <h1 className={titleClassName || "text-3xl md:text-4xl font-syne font-bold"}>{title}</h1>
            </div>

            <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10"
            >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
            </Link>
        </div>
    );
}