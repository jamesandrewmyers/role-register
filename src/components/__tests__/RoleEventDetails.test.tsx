import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import RoleEventDetails from '../RoleEventDetails';

const mockEvent = {
  id: 'event-123',
  eventListingId: 'listing-456',
  eventType: 'Interview',
  eventTitle: 'Phone screen',
  eventDate: 1704067200,
  eventNotes: 'Initial screening call',
};

global.fetch = vi.fn();

describe('RoleEventDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('When viewing an existing event', () => {
    it('should display event details in read-only mode', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      expect(screen.getByText('Event Details')).toBeInTheDocument();
      expect(screen.getByText('Interview')).toBeInTheDocument();
      expect(screen.getByText('Phone screen')).toBeInTheDocument();
      expect(screen.getByText('Initial screening call')).toBeInTheDocument();
    });

    it('should display the event ID', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      expect(screen.getByText('event-123')).toBeInTheDocument();
    });

    it('should display the event date in localized format', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      const dateElement = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dateElement).toBeInTheDocument();
    });

    it('should display dash when event has no date', () => {
      const eventWithoutDate = { ...mockEvent, eventDate: null };
      const onClose = vi.fn();
      render(<RoleEventDetails event={eventWithoutDate} onClose={onClose} />);
      
      const dateSection = screen.getByText('Date').nextElementSibling;
      expect(dateSection?.textContent).toBe('-');
    });

    it('should display dash when event has no notes', () => {
      const eventWithoutNotes = { ...mockEvent, eventNotes: null };
      const onClose = vi.fn();
      render(<RoleEventDetails event={eventWithoutNotes} onClose={onClose} />);
      
      const notesSection = screen.getByText('Notes').nextElementSibling;
      expect(notesSection?.textContent).toBe('-');
    });

    it('should have Edit button in read-only mode', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should have close button', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });

  describe('When creating a new event', () => {
    it('should start in editing mode', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails listingId="listing-456" onClose={onClose} />);
      
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should not display event ID in create mode', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails listingId="listing-456" onClose={onClose} />);
      
      expect(screen.queryByText(/ID/i)).not.toBeInTheDocument();
    });

    it('should have default values for new event', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails listingId="listing-456" onClose={onClose} />);
      
      const typeSelect = screen.getByRole('combobox');
      expect(typeSelect).toHaveValue('Not Applying');
    });

    it('should display all event type options', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails listingId="listing-456" onClose={onClose} />);
      
      expect(screen.getByRole('option', { name: 'Not Applying' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Application' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Interview' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Offer' })).toBeInTheDocument();
    });
  });

  describe('When editing an event', () => {
    it('should switch to edit mode when Edit button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      const editButton = screen.getByText('Edit');
      await user.click(editButton);
      
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should allow changing event type', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      await user.click(screen.getByText('Edit'));
      
      const typeSelect = screen.getByRole('combobox');
      await user.selectOptions(typeSelect, 'Application');
      
      expect(typeSelect).toHaveValue('Application');
    });

    it('should allow changing event title', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      await user.click(screen.getByText('Edit'));
      
      const titleInput = screen.getByDisplayValue('Phone screen');
      await user.clear(titleInput);
      await user.type(titleInput, 'Technical interview');
      
      expect(titleInput).toHaveValue('Technical interview');
    });

    it('should allow changing event notes', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      await user.click(screen.getByText('Edit'));
      
      const notesTextarea = screen.getByDisplayValue('Initial screening call');
      await user.clear(notesTextarea);
      await user.type(notesTextarea, 'Updated notes');
      
      expect(notesTextarea).toHaveValue('Updated notes');
    });

    it('should revert changes when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      await user.click(screen.getByText('Edit'));
      
      const titleInput = screen.getByDisplayValue('Phone screen');
      await user.clear(titleInput);
      await user.type(titleInput, 'Changed title');
      
      await user.click(screen.getByText('Cancel'));
      
      expect(screen.getByText('Phone screen')).toBeInTheDocument();
    });
  });

  describe('When saving an event', () => {
    it('should call API to create new event', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'new-event-id' }),
      });
      
      render(<RoleEventDetails listingId="listing-456" onClose={onClose} />);
      
      const titleInput = screen.getByText('Title').nextElementSibling as HTMLInputElement;
      await user.type(titleInput, 'New event title');
      
      await user.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/role-listing/listing-456/events',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('should call API to update existing event', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvent,
      });
      
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/role-listing/listing-456/events/event-123',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('should close modal after successful save', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvent,
      });
      
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('When closing the modal', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      await user.click(screen.getByText('✕'));
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when Cancel is clicked in create mode', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RoleEventDetails listingId="listing-456" onClose={onClose} />);
      
      await user.click(screen.getByText('Cancel'));
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('When date picker is used', () => {
    it('should not allow selecting future dates', async () => {
      const onClose = vi.fn();
      render(<RoleEventDetails listingId="listing-456" onClose={onClose} />);
      
      const dateInput = screen.getByText('Date').nextElementSibling?.querySelector('input');
      expect(dateInput).toHaveAttribute('maxLength', '10');
    });

    it('should format date as yyyy-MM-dd', () => {
      const onClose = vi.fn();
      render(<RoleEventDetails event={mockEvent} onClose={onClose} />);
      
      expect(screen.getByText('Date')).toBeInTheDocument();
    });
  });
});
