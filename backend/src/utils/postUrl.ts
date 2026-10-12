import type { Platform } from '../models/Campaign';
import { AppError } from './AppError';

const PLATFORM_HOSTS: Record<Platform, readonly string[]> = {
  instagram: ['instagram.com', 'www.instagram.com', 'm.instagram.com'],
  youtube: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
};

const EXAMPLES: Record<Platform, string> = {
  instagram: 'https://www.instagram.com/reel/C1a2b3c4d5e/',
  youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};

const PLATFORM_LABELS: Record<Platform, string> = { instagram: 'an Instagram', youtube: 'a YouTube' };

function invalid(platform: Platform): AppError {
  return AppError.badRequest(
    `Post link must be ${PLATFORM_LABELS[platform]} post URL, e.g. ${EXAMPLES[platform]}`,
  );
}

/**
 * Validates that `raw` is a link to a post on the campaign's platform and returns a canonical form
 * (https, no "www."/"m.", no tracking query params, no trailing slash) so that the same post
 * submitted twice with cosmetic differences is still recognised as a duplicate.
 */
export function normalizePostUrl(raw: string, platform: Platform): string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw invalid(platform);
  }

  const host = url.hostname.toLowerCase();
  if (!['http:', 'https:'].includes(url.protocol) || !PLATFORM_HOSTS[platform].includes(host)) {
    throw invalid(platform);
  }

  const path = url.pathname.replace(/\/+$/, '');

  if (platform === 'youtube') {
    // youtu.be/<id> and youtube.com/watch?v=<id> are the same video.
    const videoId = host === 'youtu.be' ? path.slice(1) : url.searchParams.get('v');
    if (videoId) {
      return `https://youtube.com/watch?v=${videoId}`;
    }
    // Shorts and other path-based video URLs, e.g. /shorts/<id>.
    if (/^\/(shorts|live)\/[\w-]+$/.test(path)) {
      return `https://youtube.com${path}`;
    }
    throw invalid(platform);
  }

  // Instagram posts, reels and IGTV: /p/<code>, /reel/<code>, /tv/<code> (optionally prefixed by a username).
  if (!/^(\/[\w.]+)?\/(p|reel|reels|tv)\/[\w-]+$/.test(path)) {
    throw invalid(platform);
  }
  return `https://instagram.com${path}`;
}
