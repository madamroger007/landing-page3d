"use server";
export async function fetchUsers() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/users`, {
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });
    return response.json();
}