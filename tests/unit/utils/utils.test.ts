import { describe, expect, it } from 'vitest';
import { formatIDR, formatMoneyFromIdr, getYouTubeEmbedUrl, resolveUserLocaleCurrency } from '@/src/utils/utils';

describe('generic utils', () => {
    it('extracts video id from youtu.be urls', () => {
        const embed = getYouTubeEmbedUrl('https://youtu.be/abcDEF12345');
        expect(embed).toContain('/embed/abcDEF12345');
    });

    it('extracts video id from youtube watch urls', () => {
        const embed = getYouTubeEmbedUrl('https://www.youtube.com/watch?v=abcDEF12345');
        expect(embed).toContain('/embed/abcDEF12345');
    });

    it('returns null for invalid youtube url input', () => {
        expect(getYouTubeEmbedUrl('not-a-url')).toBeNull();
    });

    it('formats IDR currency consistently', () => {
        expect(formatIDR(100000)).toContain('100.000');
        expect(formatMoneyFromIdr(250000)).toContain('250.000');
    });

    it('returns fixed locale and currency defaults', () => {
        expect(resolveUserLocaleCurrency()).toEqual({ locale: 'id-ID', currency: 'IDR' });
    });
});
