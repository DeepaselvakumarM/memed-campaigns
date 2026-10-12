import { render, screen } from '@testing-library/react';
import type { Earnings } from '@/lib/types';
import { EarningsSummary } from './EarningsSummary';

function earnings(overrides: Partial<Earnings> = {}): Earnings {
  return { totalEarnings: 6000, totalEntitled: 6000, unpaidDueToBudget: 0, submissionCount: 2, submissions: [], ...overrides };
}

describe('EarningsSummary', () => {
  it('shows total paid earnings and the number of posts', () => {
    render(<EarningsSummary earnings={earnings()} />);
    expect(screen.getByText('Total earnings (paid)').nextSibling).toHaveTextContent('₹6,000');
    expect(screen.getByText('Posts submitted').nextSibling).toHaveTextContent('2');
  });

  it('only shows unpaid earnings when a budget cap held some back', () => {
    const { rerender } = render(<EarningsSummary earnings={earnings()} />);
    expect(screen.queryByText(/unpaid/)).not.toBeInTheDocument();

    rerender(<EarningsSummary earnings={earnings({ totalEntitled: 10000, unpaidDueToBudget: 4000 })} />);
    expect(screen.getByText('Earned but unpaid (budget ran out)').nextSibling).toHaveTextContent('₹4,000');
  });
});
