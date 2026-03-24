type ErrorReportContext = {
    source?: string;
    route?: string;
    method?: string;
    metadata?: Record<string, unknown>;
};

const MAX_TEXT_LENGTH = 2900;

let isSending = false;
let isInstalled = false;

function normalizeError(error: unknown): { name: string; message: string; stack?: string } {
    if (error instanceof Error) {
        return {
            name: error.name || "Error",
            message: error.message || "Unknown error",
            stack: error.stack,
        };
    }

    if (typeof error === "string") {
        return { name: "Error", message: error };
    }

    try {
        return { name: "Error", message: JSON.stringify(error) };
    } catch {
        return { name: "Error", message: String(error) };
    }
}

function stringifyArgs(args: unknown[]): string {
    const normalized = args.map((arg) => {
        if (arg instanceof Error) {
            return `${arg.name}: ${arg.message}`;
        }

        if (typeof arg === "string") {
            return arg;
        }

        try {
            return JSON.stringify(arg);
        } catch {
            return String(arg);
        }
    });

    return normalized.join(" | ");
}

function truncate(text: string, maxLength = MAX_TEXT_LENGTH): string {
    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength - 3)}...`;
}

function shouldNotifySlack(): boolean {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) {
        return false;
    }

    const enabled = process.env.SLACK_ERROR_NOTIFIER_ENABLED;
    if (enabled === "false") {
        return false;
    }

    if (enabled === "true") {
        return true;
    }

    return process.env.NODE_ENV === "production";
}

export async function reportErrorToSlack(error: unknown, context: ErrorReportContext = {}) {
    if (!shouldNotifySlack()) {
        return;
    }

    if (isSending) {
        return;
    }

    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) {
        return;
    }

    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Next.js App";
    const normalizedError = normalizeError(error);

    const details = {
        app: appName,
        env: process.env.NODE_ENV || "unknown",
        source: context.source || "unknown",
        route: context.route || "unknown",
        method: context.method || "unknown",
        timestamp: new Date().toISOString(),
        errorName: normalizedError.name,
        metadata: context.metadata,
    };

    const messageBlock = [
        "*Application Error*",
        `*Message:* ${truncate(normalizedError.message, 500)}`,
        `*Environment:* ${details.env}`,
        `*Source:* ${details.source}`,
        `*Route:* ${details.route}`,
        `*Method:* ${details.method}`,
        `*Time:* ${details.timestamp}`,
    ].join("\n");

    const stackBlock = normalizedError.stack ? truncate(normalizedError.stack) : "No stack trace";
    const metadataBlock = details.metadata ? truncate(JSON.stringify(details.metadata, null, 2), 1500) : "None";

    const payload = {
        text: `[${appName}] ${normalizedError.name}: ${normalizedError.message}`,
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: messageBlock,
                },
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Stack*\n\`\`\`${stackBlock}\`\`\``,
                },
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Metadata*\n\`\`\`${metadataBlock}\`\`\``,
                },
            },
        ],
    };

    try {
        isSending = true;

        await fetch(webhook, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    } catch {
        // Ignore to avoid crashing request lifecycle for notification failures.
    } finally {
        isSending = false;
    }
}

export function installGlobalSlackErrorReporter() {
    if (isInstalled) {
        return;
    }

    isInstalled = true;

    const originalConsoleError = console.error.bind(console);

    console.error = (...args: unknown[]) => {
        originalConsoleError(...args);

        const maybeError = args.find((item) => item instanceof Error);
        const baseError = maybeError ?? new Error(stringifyArgs(args));

        void reportErrorToSlack(baseError, {
            source: "console.error",
            metadata: {
                args: truncate(stringifyArgs(args), 1000),
            },
        });
    };

    process.on("uncaughtException", (error) => {
        void reportErrorToSlack(error, { source: "process.uncaughtException" });
    });

    process.on("unhandledRejection", (reason) => {
        void reportErrorToSlack(reason, { source: "process.unhandledRejection" });
    });
}
