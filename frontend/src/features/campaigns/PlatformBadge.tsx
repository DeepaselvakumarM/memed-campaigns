import { PLATFORM_LABELS } from '@/lib/format';
import type { Platform } from '@/lib/types';
import { InstagramIcon, YouTubeIcon } from '@/ui/icons';
import styles from './campaigns.module.css';

export function PlatformBadge({ platform }: { platform: Platform }) {
  const Icon = platform === 'instagram' ? InstagramIcon : YouTubeIcon;
  return (
    <span className={`${styles.platform} ${styles[platform]}`}>
      <Icon size={14} />
      {PLATFORM_LABELS[platform]}
    </span>
  );
}
