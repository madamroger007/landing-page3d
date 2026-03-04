"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Customizations {
    accentColor?: string;
    heroHeadline?: string;
    heroSubtext?: string;
    heroImage?: string;
    theme?: "dark" | "blue" | "purple" | "neon";
}

interface AgentContextType {
    customizations: Customizations;
    setCustomizations: (c: Customizations) => void;
    resetCustomizations: () => void;
}

const defaultCustomizations: Customizations = {
    accentColor: "#00d2ff",
    heroHeadline: "Create NFTs Artwork And Sell",
    heroSubtext: "NFT lets you financially support artists you like, build your long-term value assets. Purus gravida vivamus fermentum tristique fermentum sed nibh pellentesque.",
    heroImage: "/hero-nft.png",
    theme: "dark",
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
    const [customizations, setCustomizationsState] = useState<Customizations>(defaultCustomizations);

    const setCustomizations = (newCustoms: Customizations) => {
        setCustomizationsState((prev) => ({ ...prev, ...newCustoms }));
    };

    const resetCustomizations = () => {
        setCustomizationsState(defaultCustomizations);
    };

    return (
        <AgentContext.Provider value={{ customizations, setCustomizations, resetCustomizations }}>
            <div style={{ "--accent-color": customizations.accentColor } as React.CSSProperties}>
                {children}
            </div>
        </AgentContext.Provider>
    );
}

export function useAgent() {
    const context = useContext(AgentContext);
    if (context === undefined) {
        throw new Error("useAgent must be used within an AgentProvider");
    }
    return context;
}
