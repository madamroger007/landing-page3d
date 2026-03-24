import { authService } from "../../services/auth";

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
            await authService.registerUser(account);
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