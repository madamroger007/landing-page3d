export function makeAdminFixture() {
    return {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin',
    };
}

export function makeOrderFixture() {
    return {
        order_id: 'ORDER-12345',
        gross_amount: 100000,
        items: [{ id: 1, name: 'Item A', price: 100000, quantity: 1 }],
        customer: { name: 'User', email: 'user@example.com', phone: '0812' },
    };
}
