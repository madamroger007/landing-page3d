import { installGlobalSlackErrorReporter } from "@/src/server/lib/slack-error-reporter";

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        installGlobalSlackErrorReporter();
    }
}
