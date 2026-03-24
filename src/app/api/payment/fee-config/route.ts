import { NextRequest, NextResponse } from "next/server";
import { requireSessionRole } from "@/src/lib/auth/withAuth";
import {
    getPaymentFeeConfigService,
    updatePaymentFeeConfigService,
} from "@/src/server/services/paymentFeeConfig";
import { paymentFeeConfigSchema } from "@/src/server/validations/paymentFeeConfig";
import { reportErrorToSlack } from "@/src/server/lib/slack-error-reporter";

export async function GET() {
    const auth = await requireSessionRole("admin");
    if (auth instanceof NextResponse) return auth;

    try {
        const data = await getPaymentFeeConfigService();
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error("[payment-fee-config:get]", error);
        await reportErrorToSlack(error, { source: 'payment-fee-config', route: '/api/payment/fee-config', method: 'GET' });
        return NextResponse.json(
            { success: false, message: "Failed to fetch payment fee config" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    const auth = await requireSessionRole("admin");
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const parsed = paymentFeeConfigSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const data = await updatePaymentFeeConfigService(parsed.data);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error("[payment-fee-config:update]", error);
        await reportErrorToSlack(error, { source: 'payment-fee-config', route: '/api/payment/fee-config', method: 'PATCH' });
        return NextResponse.json(
            { success: false, message: "Failed to update payment fee config" },
            { status: 500 }
        );
    }
}
