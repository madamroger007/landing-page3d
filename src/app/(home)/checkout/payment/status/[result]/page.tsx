import { notFound } from "next/navigation";
import PaymentStatusError from "./components/payment-status-error";
import PaymentStatusSuccess from "./components/payment-status-success";

type PaymentStatusResultPageProps = {
    params: Promise<{ result: string }>;
};

export default async function PaymentStatusResultPage({ params }: PaymentStatusResultPageProps) {
    const { result } = await params;

    if (result === "success") {
        return <PaymentStatusSuccess />;
    }

    if (result === "error") {
        return <PaymentStatusError />;
    }

    notFound();
}
