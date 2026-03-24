import { authService } from "../../services/auth";
import { tokenService } from "../../services/token";

async function seed() {
    const dummyAccounts = [
        {
            email: process.env.ADMIN_EMAIL || "admin@example.com",
            name: "admin",
            password: process.env.ADMIN_PASSWORD || "password", // Should be properly hashed in production
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];
    try {
        for (const account of dummyAccounts) {
            const result = await authService.registerUser(account);
            await tokenService.generateToken(result.user?.id || "", "Admin Token", undefined);
        }
    } catch (error) {
        console.error("Error seeding accounts:", error);
        throw error;
    }
}


seed().catch((err) => {
    console.error(err);
    process.exit(1);
});