import { expect, test } from "@playwright/test";

const sampleCart = [
    {
        id: 101,
        name: "E2E Product",
        description: "E2E product description",
        price: 200000,
        category: "E2E",
        image: "",
        quantity: 1,
        videoUrl: "",
    },
];

test.describe("Storefront and checkout journey", () => {
    test("home and products pages render key UI", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("link", { name: "Products" }).first()).toBeVisible();

        await page.goto("/products");
        await expect(page.locator("#product-search")).toBeVisible();
        await page.locator("#product-search").fill("definitely-no-match-query");
        await expect(page.getByText("No products found")).toBeVisible();
    });

    test("checkout validates form and payment method selection", async ({ page }) => {
        await page.goto("/");
        await page.evaluate((cart) => {
            localStorage.setItem("cart", JSON.stringify(cart));
        }, sampleCart);

        await page.goto("/checkout");
        await expect(page.getByRole("heading", { name: "Order Details" })).toBeVisible();

        await expect(page.getByRole("button", { name: "Check your input" })).toBeDisabled();

        await page.locator("#name").fill("E2E Tester");
        await page.locator("#email").fill("e2e@example.com");
        await page.locator("#phone").fill("08123456789");

        await page.locator("button[aria-haspopup='listbox']").click();
        await page.getByRole("option", { name: "QRIS" }).click();

        const completePaymentButton = page.getByRole("button", { name: "Complete Payment" });
        await expect(completePaymentButton).toBeEnabled();
    });

    test("payment status page reads pending order from localStorage", async ({ page }) => {
        const orderId = "ORDER-E2E-123";

        await page.goto("/");
        await page.evaluate(({ id }) => {
            const pendingOrders = {
                [id]: {
                    order_id: id,
                    gross_amount: 200000,
                    items: [{ id: 101, name: "E2E Product", price: 200000, quantity: 1 }],
                    customer: { name: "E2E Tester", email: "e2e@example.com" },
                    payment_method: "qris",
                    payment_name: "QRIS",
                    status: "pending",
                    createdAt: new Date().toISOString(),
                    store: "Midtrans",
                },
            };
            localStorage.setItem("pending_orders", JSON.stringify(pendingOrders));
        }, { id: orderId });

        await page.goto(`/checkout/payment/${orderId}`);
        await expect(page.getByText("Order Total")).toBeVisible();
        await expect(page.getByText("Invoice Number")).toBeVisible();
        await expect(page.getByRole("button", { name: "Check Payment Status" })).toBeVisible();
    });
});
