import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateCampaignForm } from './CreateCampaignForm';

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateCampaignForm />
    </QueryClientProvider>,
  );
}

function mockFetchResponse(status: number, body: unknown) {
  const fetchMock = jest.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body });
  global.fetch = fetchMock;
  return fetchMock;
}

describe('CreateCampaignForm', () => {
  it('sends the campaign with numeric values to the API and confirms success', async () => {
    const fetchMock = mockFetchResponse(201, { campaign: { id: 'c1', name: 'Diwali Launch' } });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Campaign name'), 'Diwali Launch');
    await user.selectOptions(screen.getByLabelText('Platform'), 'instagram');
    await user.type(screen.getByLabelText('Total budget (₹)'), '10000');
    await user.click(screen.getByRole('button', { name: 'Create campaign' }));

    expect(await screen.findByText(/is live/)).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/campaigns$/);
    expect(JSON.parse(init.body)).toEqual({
      name: 'Diwali Launch',
      platform: 'instagram',
      totalBudget: 10000,
      milestones: [
        { viewThreshold: 10000, payout: 500 },
        { viewThreshold: 50000, payout: 2000 },
        { viewThreshold: 100000, payout: 5000 },
      ],
    });
  });

  it("shows the API's validation message", async () => {
    mockFetchResponse(400, { error: 'Total budget is required.' });
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Create campaign' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Total budget is required.');
  });

  it('adds and removes milestone rows', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Add milestone' }));
    expect(screen.getByLabelText('Milestone 4 views')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove milestone 1' }));
    expect(screen.queryByLabelText('Milestone 4 views')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Milestone 1 views')).toHaveValue(50000);
  });
});
