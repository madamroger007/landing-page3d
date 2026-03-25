"use client";

import { TypeIcon, Instagram,  Youtube,  Facebook } from 'lucide-react';
import LogoComponent from './LogoComponent';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="pt-24 pb-12 px-6 max-w-7xl mx-auto border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
                <LogoComponent />

                <div className="flex items-center gap-6">
                    <Link href={process.env.NEXT_PUBLIC_APP_YOUTUBE || ""} target="_blank">
                        <SocialIcon icon={<Youtube size={18} />} />
                    </Link>
                    <Link href={process.env.NEXT_PUBLIC_APP_INSTAGRAM || ""} target="_blank">
                        <SocialIcon icon={<Instagram size={18} />} />
                    </Link>
                    <Link href={process.env.NEXT_PUBLIC_APP_TIKTOK || ""} target="_blank">
                        <SocialIcon icon={<TypeIcon size={18} />} />
                    </Link>
                    <Link href={process.env.NEXT_PUBLIC_APP_FACEBOOK || ""} target="_blank">
                        <SocialIcon icon={<Facebook size={18} />} />
                    </Link>

                </div>

                <div className="text-center md:text-right space-y-2">
                    <p className="text-white/60 text-sm hover:text-white cursor-pointer transition-colors">Terms and Conditions</p>
                    <p className="text-white/40 text-xs">All Rights reserves</p>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
    return (
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-accent-blue hover:text-white transition-all cursor-pointer">
            {icon}
        </div>
    );
}