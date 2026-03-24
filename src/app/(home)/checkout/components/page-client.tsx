"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/src/store/context/cart/CartContext";
import CustomCursor from "@/src/components/CustomCursor";
import { resolveUserLocaleCurrency } from "@/src/utils/utils";
import { validateVoucherByCode } from "@/src/server/actions/vouchers/action";
import CheckoutHeader from "./checkout-header";
import CheckoutItemsSection from "./checkout-items-section";
import CheckoutSummaryCard from "./checkout-summary-card";
import { CustomerInfo, PaymentMethodValue } from "./checkout-types";

type CardInput = {
    card_number: string;
    card_exp_month: string;
    card_exp_year: string;
    card_cvv: string;
};

type MidtransClientConfig = {
    clientKey: string;
    environment: "production" | "sandbox";
};

type CheckoutPageClientProps = {
    midtransConfig: MidtransClientConfig | null;
};

declare global {
    interface Window {
        MidtransNew3ds?: {
            getCardToken: (
                cardData: Record<string, string>,
                options: {
                    onSuccess: (response: { token_id?: string }) => void;
                    onFailure: (response: { status_message?: string }) => void;
                }
            ) => void;
            authenticate?: (
                redirectUrl: string,
                options: {
                    performAuthentication?: (url: string) => void;
                    onSuccess: (response: { status_message?: string; transaction_status?: string }) => void;
                    onPending: (response: { status_message?: string; transaction_status?: string }) => void;
                    onFailure: (response: { status_message?: string; transaction_status?: string }) => void;
                }
            ) => void;
        };
    }
}

function mapPaymentMethodToFeeEstimate(paymentMethod: PaymentMethodValue | "") {
    return paymentMethod || undefined;
}

export default function CheckoutPageClient({ midtransConfig }: CheckoutPageClientProps) {
    const router = useRouter();
    const {
        cart,
        cartTotal,
        cartCount,
        removeFromCart,
        deleteFromCart,
        addToCart,
        clearCart,
        checkout,
        checkoutStatus,
        error: checkoutError,
    } = useCartContext();

    const [customerInfo, setCustomerInfo] = React.useState<CustomerInfo>({
        name: "",
        email: "",
        phone: "",
    });

    const [open, setOpen] = React.useState(false);
    const [voucherResult, setVoucherResult] = React.useState<{ valid: boolean; message?: string } | undefined>(undefined);
    const [voucherLoading, setVoucherLoading] = React.useState(false);
    const [discountPercent, setDiscountPercent] = React.useState(0);
    const [feeAmount, setFeeAmount] = React.useState(0);
    const [feeSource, setFeeSource] = React.useState<"midtrans" | "fallback">("fallback");
    const [feeMessage, setFeeMessage] = React.useState<string>("");
    const [paymentError, setPaymentError] = React.useState<string>("");
    const [localeCurrency, setLocaleCurrency] = React.useState({ locale: "id-ID", currency: "IDR" });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<PaymentMethodValue | "">("");
    const [midtransScriptReady, setMidtransScriptReady] = React.useState(false);
    const [cardInput, setCardInput] = React.useState<CardInput>({
        card_number: "",
        card_exp_month: "",
        card_exp_year: "",
        card_cvv: "",
    });

    React.useEffect(() => {
        if (window.MidtransNew3ds) {
            setMidtransScriptReady(true);
            return;
        }

        const existingScript = document.getElementById("midtrans-script");
        if (existingScript) {
            const onLoad = () => setMidtransScriptReady(true);
            existingScript.addEventListener("load", onLoad);

            return () => {
                existingScript.removeEventListener("load", onLoad);
            };
        }

        if (!midtransConfig?.clientKey) return;

        const script = document.createElement("script");
        script.id = "midtrans-script";
        script.type = "text/javascript";
        script.src = "https://api.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js";
        script.onload = () => setMidtransScriptReady(true);
        script.onerror = () => setMidtransScriptReady(false);
        script.setAttribute("data-environment", midtransConfig.environment);
        script.setAttribute("data-client-key", midtransConfig.clientKey);
        document.body.appendChild(script);

        return () => {
            script.onload = null;
            script.onerror = null;
        };
    }, [midtransConfig]);

    const openModal = () => {
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
    };

    const handleSubmitVoucher = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const voucher = (e.currentTarget.elements.namedItem("voucher") as HTMLInputElement | null)?.value || "";

        setVoucherLoading(true);
        const result = await validateVoucherByCode(voucher);
        setVoucherResult({ valid: result.valid, message: result.message });

        if (result.valid) {
            setDiscountPercent(result.discountPercent ?? 0);
            closeModal();
        }

        setVoucherLoading(false);
    };

    React.useEffect(() => {
        setLocaleCurrency(resolveUserLocaleCurrency());
    }, []);

    React.useEffect(() => {
        let ignore = false;

        const estimateFee = async () => {
            try {
                const response = await fetch("/api/payment/fee-estimate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subtotal: cartTotal,
                        paymentMethod: mapPaymentMethodToFeeEstimate(selectedPaymentMethod),
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to estimate fee");
                }

                const data = await response.json();
                if (!ignore) {
                    setFeeAmount(Number(data.amount || 0));
                    setFeeSource(data.source === "midtrans" ? "midtrans" : "fallback");
                    setFeeMessage(data.message || "");
                }
            } catch {
                if (!ignore) {
                    setFeeAmount(0);
                    setFeeSource("fallback");
                    setFeeMessage("Unable to estimate fee at the moment.");
                }
            }
        };

        estimateFee();

        return () => {
            ignore = true;
        };
    }, [cartTotal, selectedPaymentMethod]);

    const isFormValid =
        customerInfo.name.trim() !== "" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email);

    const discountAmount = Math.round(cartTotal * (discountPercent / 100));
    const grandTotal = Math.max(0, cartTotal + feeAmount - discountAmount);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const sanitized = value.replace(/[^0-9]/g, "");
        setCardInput((prev) => ({ ...prev, [name]: sanitized }));
    };

    const getCardToken = async (grossAmount: number) => {
        if (!midtransScriptReady || !window.MidtransNew3ds) {
            throw new Error("Midtrans card script is not loaded. Please refresh and try again.");
        }

        if (!cardInput.card_number || !cardInput.card_exp_month || !cardInput.card_exp_year || !cardInput.card_cvv) {
            throw new Error("Please complete card number, expiry month/year, and CVV.");
        }

        const normalizedMonth = cardInput.card_exp_month.padStart(2, "0").slice(0, 2);
        const normalizedYearRaw = cardInput.card_exp_year.trim();
        const normalizedYear = normalizedYearRaw.length === 2 ? `20${normalizedYearRaw}` : normalizedYearRaw;
        const normalizedCardNumber = cardInput.card_number.replace(/\s+/g, "");
        const normalizedCvv = cardInput.card_cvv.slice(0, 4);

        if (Number(normalizedMonth) < 1 || Number(normalizedMonth) > 12) {
            throw new Error("Card expiry month must be between 01 and 12.");
        }

        if (!/^\d{4}$/.test(normalizedYear)) {
            throw new Error("Card expiry year must be 4 digits (YYYY).");
        }

        if (normalizedCardNumber.length < 13 || normalizedCardNumber.length > 19) {
            throw new Error("Card number is invalid.");
        }

        if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
            throw new Error("Total amount must be greater than 0.");
        }

        return await new Promise<string>((resolve, reject) => {
            window.MidtransNew3ds?.getCardToken(
                {
                    card_number: normalizedCardNumber,
                    card_exp_month: normalizedMonth,
                    card_exp_year: normalizedYear,
                    card_cvv: normalizedCvv,
                    gross_amount: String(Math.round(grossAmount)),
                },
                {
                    onSuccess: (response) => {
                        if (!response?.token_id) {
                            reject(new Error("Failed to get card token from Midtrans."));
                            return;
                        }

                        resolve(response.token_id);
                    },

                    onFailure: (response) => {
                        reject(new Error(response?.status_message || "Card tokenization failed."));
                    },
                }
            );
        });
    };

    const handleCardAuthentication = async (redirectUrl: string): Promise<"redirected" | "completed"> => {
        if (!window.MidtransNew3ds?.authenticate) {
            window.location.assign(redirectUrl);
            return "redirected";
        }

        return await new Promise<"redirected" | "completed">((resolve, reject) => {
            window.MidtransNew3ds?.authenticate?.(redirectUrl, {
                performAuthentication: (url) => {
                    resolve("redirected");
                    window.location.assign(url);
                },
                onSuccess: () => resolve("completed"),
                onPending: () => resolve("completed"),
                onFailure: (response) => reject(new Error(response?.status_message || "3DS authentication failed.")),
            });
        });
    };

    const handleCheckout = async () => {
        if (!isFormValid || cart.length === 0 || !selectedPaymentMethod) {
            if (!selectedPaymentMethod) {
                setPaymentError("Please select a payment method before continuing.");
            }
            return;
        }

        setPaymentError("");

        if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
            setPaymentError("Total payment amount must be greater than 0.");
            return;
        }

        const payload = {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
        };

        let cardTokenId: string | undefined;
        if (selectedPaymentMethod === "credit_card") {
            try {
                cardTokenId = await getCardToken(grandTotal);
            } catch (error) {
                setPaymentError(error instanceof Error ? error.message : "Card tokenization failed.");
                return;
            }
        }

        const result = await checkout(payload, grandTotal, selectedPaymentMethod, cardTokenId);

        if (result) {
            const redirectUrl = String((result.payment_data?.redirect_url as string | undefined) || "");

            if (selectedPaymentMethod === "credit_card" && redirectUrl) {
                try {
                    const authResult = await handleCardAuthentication(redirectUrl);
                    if (authResult === "redirected") {
                        return;
                    }
                } catch (error) {
                    setPaymentError(error instanceof Error ? error.message : "3DS authentication failed.");
                    return;
                }
            }

            clearCart();
            router.push(`/checkout/payment/${result.order_id}`);
        }

        if (!result) {
            setPaymentError(checkoutError || "Failed to create payment transaction. Check Midtrans configuration and item totals.");
        }
    };

    return (
        <div
            className="min-h-screen text-white pb-20"
            style={{
                background:
                    "radial-gradient(ellipse at 20% 20%, rgba(84,119,146,0.12) 0%, rgba(0,0,128,0.25) 50%, #000 100%)",
            }}
        >
            <CustomCursor />
            <CheckoutHeader cartCount={cartCount} />

            <main className="max-w-6xl mx-auto px-6 pt-12 md:pt-20">
                <div className="grid md:grid-cols-2 grid-cols-1 lg:grid-cols-3 gap-12">
                    <CheckoutItemsSection
                        cart={cart}
                        customerInfo={customerInfo}
                        localeCurrency={localeCurrency}
                        onInputChange={handleInputChange}
                        onDelete={deleteFromCart}
                        onIncrement={addToCart}
                        onDecrement={removeFromCart}
                    />

                    <CheckoutSummaryCard
                        cartLength={cart.length}
                        cartTotal={cartTotal}
                        localeCurrency={localeCurrency}
                        feeAmount={feeAmount}
                        feeSource={feeSource}
                        feeMessage={feeMessage}
                        discountAmount={discountAmount}
                        grandTotal={grandTotal}
                        isFormValid={isFormValid}
                        customerName={customerInfo.name}
                        customerEmail={customerInfo.email}
                        selectedPaymentMethod={selectedPaymentMethod}
                        checkoutStatus={checkoutStatus}
                        paymentError={paymentError}
                        openVoucher={open}
                        voucherResult={voucherResult}
                        voucherLoading={voucherLoading}
                        cardInput={cardInput}
                        onOpenVoucher={openModal}
                        onCloseVoucher={closeModal}
                        onSubmitVoucher={handleSubmitVoucher}
                        onSelectPaymentMethod={setSelectedPaymentMethod}
                        onCardInputChange={handleCardInputChange}
                        onCheckout={handleCheckout}
                    />
                </div>
            </main>
        </div>
    );
}
