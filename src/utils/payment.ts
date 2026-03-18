export type PaymentPersistenceFields = {
    payment_name: string | null;
    payment_va: string | null;
};

type PaymentPersistenceOptions = {
    preferredPaymentName?: string;
};

type MidtransVaNumber = { bank?: string; va_number?: string };
type MidtransBankTransfer = { bank?: string; va_number?: string; va_numbers?: MidtransVaNumber[] };

const PROVIDER_NAME_MAP: Record<string, string> = {
    alfamart: "Alfamart",
    bca: "BCA",
    bni: "BNI",
    bri: "BRI",
    cimb: "CIMB Niaga",
    credit_card: "Credit Card",
    dana: "DANA",
    echannel: "Mandiri",
    gopay: "GoPay",
    mandiri: "Mandiri",
    ovo: "OVO",
    qris: "QRIS",
    seabank: "SeaBank",
};

const GENERIC_PAYMENT_TYPES = new Set(["bank_transfer", "cstore"]);

function asNonEmptyString(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function normalizeProviderName(value: string) {
    const normalizedKey = value.trim().toLowerCase().replace(/[\s-]+/g, "_");

    if (PROVIDER_NAME_MAP[normalizedKey]) {
        return PROVIDER_NAME_MAP[normalizedKey];
    }

    return value
        .trim()
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

function extractVaNumbers(data: Record<string, unknown>) {
    const vaNumbers: MidtransVaNumber[] = [];

    if (Array.isArray(data.va_numbers)) {
        vaNumbers.push(...(data.va_numbers as MidtransVaNumber[]));
    }

    const bankTransfer = (data.bank_transfer as MidtransBankTransfer | undefined) || undefined;
    if (Array.isArray(bankTransfer?.va_numbers)) {
        vaNumbers.push(...bankTransfer.va_numbers);
    }

    const fallbackBank = asNonEmptyString(data.bank) || asNonEmptyString(bankTransfer?.bank);
    const providerSpecificVaFields: Array<{ bank?: string; value?: unknown }> = [
        { bank: "bca", value: data.bca_va_number },
        { bank: "bni", value: data.bni_va_number },
        { bank: "bri", value: data.bri_va_number },
        { bank: "cimb", value: data.cimb_va_number },
        { bank: "seabank", value: data.seabank_va_number },
        { bank: fallbackBank, value: bankTransfer?.va_number },
        { bank: fallbackBank, value: data.va_number },
    ];

    for (const entry of providerSpecificVaFields) {
        const va = asNonEmptyString(entry.value);
        if (!va) continue;

        vaNumbers.push({
            bank: entry.bank,
            va_number: va,
        });
    }

    // Deduplicate by VA value to avoid double-rendering when payload exposes both list and single fields.
    const seenVa = new Set<string>();
    return vaNumbers.filter((entry) => {
        const va = asNonEmptyString(entry.va_number);
        if (!va || seenVa.has(va)) {
            return false;
        }

        seenVa.add(va);
        return true;
    });
}

export function extractPaymentPersistenceFields(
    data: Record<string, unknown>,
    options: PaymentPersistenceOptions = {}
): PaymentPersistenceFields {
    const vaNumbers = extractVaNumbers(data);
    const firstVa = vaNumbers.find((entry) => asNonEmptyString(entry?.va_number));
    const bankTransfer = (data.bank_transfer as MidtransBankTransfer | undefined) || undefined;
    const preferredPaymentName = asNonEmptyString(options.preferredPaymentName);
    const bank = asNonEmptyString(data.bank) || asNonEmptyString(bankTransfer?.bank);
    const store = asNonEmptyString(data.store);
    const paymentType = asNonEmptyString(data.payment_type);
    const paymentTypeName =
        paymentType && !GENERIC_PAYMENT_TYPES.has(paymentType.toLowerCase()) ? paymentType : undefined;

    const paymentNameSource =
        preferredPaymentName ||
        asNonEmptyString(firstVa?.bank) ||
        bank ||
        store ||
        paymentTypeName;

    let paymentName = paymentNameSource ? normalizeProviderName(paymentNameSource) : null;

    if (!paymentName && paymentType === "echannel") {
        paymentName = "Mandiri";
    }

    const paymentVa =
        asNonEmptyString(firstVa?.va_number) ||
        asNonEmptyString(data.va_number) ||
        asNonEmptyString(data.bill_key) ||
        asNonEmptyString(data.payment_code) ||
        null;

    return {
        payment_name: paymentName,
        payment_va: paymentVa,
    };
}