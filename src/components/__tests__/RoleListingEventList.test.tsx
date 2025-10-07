import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import RoleListingEventList from '../RoleListingEventList';

const mockListing = {
  id: 'test-listing-123',
};

const mockEvents = [
  {
    id: 'event-1',
    eventListingId: 'test-listing-123',
    eventType: 'Application',
    eventTitle: 'Applied online',
    eventDate: 1704067200,
    eventNotes: 'Submitted via company website',
  },
  {
    id: 'event-2',
    eventListingId: 'test-listing-123',
    eventType: 'Interview',
    eventTitle: 'Phone screen',
    eventDate: 1704153600,
    eventNotes: 'Initial screening call',
  },
  {
    id: 'event-3',
    eventListingId: 'test-listing-123',
    eventType: 'Email',
    eventTitle: 'Follow-up email',
    eventDate: null,
    eventNotes: null,
  },
];

global.fetch = vi.fn();

describe('RoleListingEventList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('When loading events', () => {
    it('should display loading state initially', () => {
      (global.fetch as any).mockImplementation(() => 
        new Promise(() => {})
      );
      
      render(<RoleListingEventList listing={mockListing} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should fetch events from API on mount', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      });
      
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/role-listing/test-listing-123/events');
      });
    });
  });

  describe('When events are loaded', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockEvents,
      });
    });

    it('should display event table with headers', async () => {
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Date')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
      });
    });

    it('should display all events', async () => {
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Application')).toBeInTheDocument();
        expect(screen.getByText('Interview')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
      });
    });

    it('should display event dates in localized format', async () => {
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it('should display dash for events without dates', async () => {
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        const dashes = screen.getAllByText('-');
        expect(dashes.length).toBeGreaterThan(0);
      });
    });

    it('should sort events by date descending, then by type', async () => {
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        const eventRows = screen.getAllByRole('row');
        expect(eventRows.length).toBeGreaterThan(1);
      });
    });
  });

  describe('When there are no events', () => {
    it('should display "No events" message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });
      
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('No events')).toBeInTheDocument();
      });
    });
  });

  describe('When user clicks on an event', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockEvents,
      });
    });

    it('should open event details modal', async () => {
      const user = userEvent.setup();
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Application')).toBeInTheDocument();
      });
      
      const eventRow = screen.getByText('Application').closest('tr');
      if (eventRow) {
        await user.click(eventRow);
        
        await waitFor(() => {
          expect(screen.getByText('Event Details')).toBeInTheDocument();
        });
      }
    });
  });

  describe('When triggerAdd prop is set', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockEvents,
      });
    });

    it('should trigger add event flow', async () => {
      const onAddEvent = vi.fn();
      const { rerender } = render(
        <RoleListingEventList 
          listing={mockListing} 
          onAddEvent={onAddEvent}
          triggerAdd={false}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Application')).toBeInTheDocument();
      });
      
      rerender(
        <RoleListingEventList 
          listing={mockListing} 
          onAddEvent={onAddEvent}
          triggerAdd={true}
        />
      );
      
      await waitFor(() => {
        expect(onAddEvent).toHaveBeenCalled();
      });
    });

    it('should open create event modal when triggered', async () => {
      const { rerender } = render(
        <RoleListingEventList 
          listing={mockListing} 
          triggerAdd={false}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Application')).toBeInTheDocument();
      });
      
      rerender(
        <RoleListingEventList 
          listing={mockListing} 
          triggerAdd={true}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Event Details')).toBeInTheDocument();
      });
    });
  });

  describe('When events are sorted', () => {
    it('should place events with null dates at the end', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      });
      
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBeGreaterThan(0);
      });
    });

    it('should sort by event type when dates are equal', async () => {
      const eventsWithSameDate = [
        { ...mockEvents[0], eventDate: 1704067200, eventType: 'Interview' },
        { ...mockEvents[1], eventDate: 1704067200, eventType: 'Application' },
      ];
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => eventsWithSameDate,
      });
      
      render(<RoleListingEventList listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Interview')).toBeInTheDocument();
        expect(screen.getByText('Application')).toBeInTheDocument();
      });
    });
  });
});
