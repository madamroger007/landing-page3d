import DashboardLayoutComponent from "@/src/components/dashboard/LayoutComponent";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayoutComponent>
            <main style={{ cursor: "copy" }} className="flex-1 bg-radial-[at_2%_8%]  from-[#547792]/20 via-[#000080]/40 to-[#000000]/80">
                <div className="max-w-7xl mx-auto">{children}</div>
            </main>
        </DashboardLayoutComponent>
    );
}