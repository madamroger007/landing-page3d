"use client";

import { useAgent } from "./AgentContext";

export function usePromptAgent() {
    const { customizations, setCustomizations, resetCustomizations } = useAgent();

    const applyPrompt = (prompt: string) => {
        const p = prompt.toLowerCase();

        // Simple rule-based parser for "AI" behavior
        if (p.includes("purple") || p.includes("cyberpunk")) {
            setCustomizations({
                accentColor: "#9d50bb",
                theme: "purple"
            });
        } else if (p.includes("blue") || p.includes("ocean")) {
            setCustomizations({
                accentColor: "#00d2ff",
                theme: "blue"
            });
        } else if (p.includes("pink") || p.includes("neon")) {
            setCustomizations({
                accentColor: "#f00b51",
                theme: "neon"
            });
        }

        if (p.includes("headline") || p.includes("title")) {
            const match = prompt.match(/["'](.*?)["']/);
            if (match) {
                setCustomizations({ heroHeadline: match[1] });
            }
        }
    };

    const handleImageUpload = (file: File) => {
        const url = URL.createObjectURL(file);
        setCustomizations({ heroImage: url });
    };

    return {
        customizations,
        applyPrompt,
        handleImageUpload,
        resetCustomizations
    };
}
