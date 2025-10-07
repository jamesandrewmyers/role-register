import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import EventInfoList from '../EventInfoList';

const mockEvents = [
  {
    id: 'event-1',
    type: 'processHtml',
    status: 'done',
    createdAt: '1704067200',
    updatedAt: '1704067260',
    retries: 0,
    payload: '{"dataReceivedId":"data-1"}',
  },
  {
    id: 'event-2',
    type: 'processHtml',
    status: 'pending',
    createdAt: '1704153600',
    retries: 0,
    payload: '{"dataReceivedId":"data-2"}',
  },
  {
    id: 'event-3',
    type: 'processHtml',
    status: 'processing',
    createdAt: '1704240000',
    updatedAt: '1704240030',
    retries: 1,
    payload: '{"dataReceivedId":"data-3"}',
  },
  {
    id: 'event-4',
    type: 'processHtml',
    status: 'error',
    createdAt: '1704326400',
    updatedAt: '1704326460',
    retries: 3,
    error: 'Failed to parse HTML',
    payload: '{"dataReceivedId":"data-4"}',
  },
];

describe('EventInfoList', () => {
  describe('When displaying a list of events', () => {
    it('should render the heading', () => {
      render(<EventInfoList events={[]} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('Event Queue')).toBeInTheDocument();
    });

    it('should render all events', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('processHtml - event-1')).toBeInTheDocument();
      expect(screen.getByText('processHtml - event-2')).toBeInTheDocument();
      expect(screen.getByText('processHtml - event-3')).toBeInTheDocument();
      expect(screen.getByText('processHtml - event-4')).toBeInTheDocument();
    });

    it('should display event types and IDs', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('processHtml - event-1')).toBeInTheDocument();
    });

    it('should display created dates in localized format', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      const dates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dates.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('When displaying event status', () => {
    it('should show done status badge', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('done')).toBeInTheDocument();
    });

    it('should show pending status badge', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('should show processing status badge', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('processing')).toBeInTheDocument();
    });

    it('should show error status badge', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  describe('When displaying retry information', () => {
    it('should show retry count when retries > 0', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('Retries: 1')).toBeInTheDocument();
      expect(screen.getByText('Retries: 3')).toBeInTheDocument();
    });

    it('should not show retry count when retries = 0', () => {
      const eventsWithoutRetries = [mockEvents[0], mockEvents[1]];
      render(<EventInfoList events={eventsWithoutRetries} onSelectEvent={vi.fn()} />);
      
      expect(screen.queryByText(/Retries:/)).not.toBeInTheDocument();
    });
  });

  describe('When displaying error information', () => {
    it('should show error message when available', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('Failed to parse HTML')).toBeInTheDocument();
    });

    it('should not show error message when not available', () => {
      const eventsWithoutErrors = [mockEvents[0], mockEvents[1]];
      render(<EventInfoList events={eventsWithoutErrors} onSelectEvent={vi.fn()} />);
      
      expect(screen.queryByText('Failed to parse HTML')).not.toBeInTheDocument();
    });
  });

  describe('When list is empty', () => {
    it('should display empty state message', () => {
      render(<EventInfoList events={[]} onSelectEvent={vi.fn()} />);
      
      expect(screen.getByText('No events in queue')).toBeInTheDocument();
    });

    it('should not display any events', () => {
      render(<EventInfoList events={[]} onSelectEvent={vi.fn()} />);
      
      expect(screen.queryByText(/processHtml/)).not.toBeInTheDocument();
    });
  });

  describe('When user interacts with events', () => {
    it('should call onSelectEvent when event is clicked', async () => {
      const user = userEvent.setup();
      const onSelectEvent = vi.fn();
      render(<EventInfoList events={mockEvents} onSelectEvent={onSelectEvent} />);
      
      const event = screen.getByText('processHtml - event-1').closest('div.cursor-pointer');
      if (event) {
        await user.click(event);
        expect(onSelectEvent).toHaveBeenCalledWith(mockEvents[0]);
      }
    });

    it('should have hover effect on events', () => {
      render(<EventInfoList events={mockEvents} onSelectEvent={vi.fn()} />);
      
      const event = screen.getByText('processHtml - event-1').closest('div.cursor-pointer');
      expect(event).toHaveClass('hover:bg-white/10');
    });
  });
});
