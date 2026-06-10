import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fetchResponse } from '../test/helpers';
import Dashboard from '../pages/dashboard';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('<Dashboard />', () => {
  it('shows a loading state initially', () => {
    fetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<Dashboard />);
    expect(screen.getByText(/loading your inventory/i)).toBeDefined();
  });

  it('renders items and aggregate stats once loaded', async () => {
    fetch.mockResolvedValue(
      fetchResponse({
        ok: true,
        json: {
          items: [
            { id: 1, title: 'Jacket', price: 50, status: 'active', category: 'Outerwear' },
            { id: 2, title: 'Mug', price: 8.5, status: 'draft', category: 'Home' },
          ],
        },
      }),
    );
    render(<Dashboard />);

    await waitFor(() => expect(screen.getByText('Jacket')).toBeDefined());
    expect(screen.getByText('Mug')).toBeDefined();
    // Total value = 58.50, formatted by the shared money() helper.
    expect(screen.getByText('£58.50')).toBeDefined();
    // "Live" appears twice: the stats label and the active item's badge.
    expect(screen.getAllByText('Live')).toHaveLength(2);
    // The draft item shows a "Draft" badge.
    expect(screen.getByText('Draft')).toBeDefined();
  });

  it('surfaces an API error payload', async () => {
    fetch.mockResolvedValue(fetchResponse({ ok: true, json: { error: 'Shopify down' } }));
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByText(/couldn.t load inventory: Shopify down/i)).toBeDefined(),
    );
  });

  it('handles a network rejection', async () => {
    fetch.mockRejectedValue(new Error('offline'));
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText(/offline/i)).toBeDefined());
  });
});
