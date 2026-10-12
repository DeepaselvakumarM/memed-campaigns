import { normalizePostUrl } from '../../src/utils/postUrl';

describe('normalizePostUrl', () => {
  it.each([
    ['https://www.instagram.com/reel/C1a2b3c4d5e/?igsh=abc', 'https://instagram.com/reel/C1a2b3c4d5e'],
    ['https://instagram.com/p/C1a2b3c4d5e', 'https://instagram.com/p/C1a2b3c4d5e'],
    ['http://m.instagram.com/some.user/reel/XYZ_-1/', 'https://instagram.com/some.user/reel/XYZ_-1'],
  ])('canonicalizes Instagram link %s', (input, expected) => {
    expect(normalizePostUrl(input, 'instagram')).toBe(expected);
  });

  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s', 'https://youtube.com/watch?v=dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?si=tracking', 'https://youtube.com/watch?v=dQw4w9WgXcQ'],
    ['https://youtube.com/shorts/abc123_-', 'https://youtube.com/shorts/abc123_-'],
  ])('canonicalizes YouTube link %s', (input, expected) => {
    expect(normalizePostUrl(input, 'youtube')).toBe(expected);
  });

  it('treats the same post in different forms as the same URL (duplicate detection)', () => {
    expect(normalizePostUrl('https://youtu.be/abc', 'youtube')).toBe(
      normalizePostUrl('https://m.youtube.com/watch?v=abc', 'youtube'),
    );
  });

  it.each([
    ['not a url', 'instagram'],
    ['https://www.youtube.com/watch?v=abc', 'instagram'], // wrong platform for the campaign
    ['https://instagram.com/someuser', 'instagram'], // a profile, not a post
    ['https://evil-instagram.com/p/abc', 'instagram'],
    ['javascript:alert(1)', 'instagram'],
    ['https://www.youtube.com/', 'youtube'],
  ] as const)('rejects %s for a %s campaign', (input, platform) => {
    expect(() => normalizePostUrl(input, platform)).toThrow(/^Post link must be/);
  });
});
