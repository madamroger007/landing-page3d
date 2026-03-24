import { afterEach, vi } from 'vitest';

// Auth service initialization requires JWT_SECRET at import time.
process.env.JWT_SECRET ??= 'test-jwt-secret';

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});
