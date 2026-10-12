import type { ReactNode } from 'react';
import { ChartIcon, CheckIcon, WalletIcon } from '@/ui/icons';
import { Logo } from '@/ui/Logo';
import styles from './auth.module.css';

const SELLING_POINTS = [
  { icon: <WalletIcon size={16} />, text: 'Pay creators by view milestones, not guesswork' },
  { icon: <CheckIcon size={16} />, text: 'Budgets that can never be overspent' },
  { icon: <ChartIcon size={16} />, text: 'Track every view and every rupee in real time' },
];

function Showcase() {
  return (
    <aside className={styles.showcase} aria-hidden="true">
      <Logo inverted />
      <div className={styles.showcaseBody}>
        <h2 className={styles.showcaseTitle}>Where brands meet the creators the internet can&apos;t stop sharing.</h2>
        <p className={styles.showcaseText}>
          Launch a campaign, let meme pages and clip accounts post for it, and pay out automatically as views climb.
        </p>
        <ul className={styles.points}>
          {SELLING_POINTS.map((point) => (
            <li key={point.text}>
              <span className={styles.pointIcon}>{point.icon}</span>
              {point.text}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.ladderPreview}>
        <span className={styles.ladderStep}>10K views<strong>₹500</strong></span>
        <span className={styles.ladderStep}>50K views<strong>₹2,000</strong></span>
        <span className={styles.ladderStep}>100K views<strong>₹5,000</strong></span>
      </div>
    </aside>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Showcase />
      <main className={styles.formSide}>
        <div className={styles.panel}>
          <div className={styles.mobileLogo}>
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
