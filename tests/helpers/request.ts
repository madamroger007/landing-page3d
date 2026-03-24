import type { NextRequest } from 'next/server';

export function makeJsonRequest(body: unknown, contentType = 'application/json'): NextRequest {
    return {
        headers: new Headers({ 'content-type': contentType }),
        json: async () => body,
    } as unknown as NextRequest;
}

export function makeRequestWithUrl(url: string): NextRequest {
    return {
        url,
        headers: new Headers(),
    } as unknown as NextRequest;
}
