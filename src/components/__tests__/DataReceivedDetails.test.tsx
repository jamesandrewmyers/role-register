import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import DataReceivedDetails from '../DataReceivedDetails';

const mockItem = {
  id: 'data-123',
  url: 'https://www.linkedin.com/jobs/view/123',
  title: 'Senior Software Engineer',
  receivedAt: '1704067200',
  processed: 'true',
  processingNotes: 'Successfully processed',
  html: '<html><body>Job posting HTML</body></html>',
  text: 'Job posting text content',
};

global.fetch = vi.fn();
global.alert = vi.fn();

describe('DataReceivedDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('When viewing item details', () => {
    it('should display the details heading', () => {
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('should display all item fields', () => {
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      expect(screen.getByText('data-123')).toBeInTheDocument();
      expect(screen.getByText('https://www.linkedin.com/jobs/view/123')).toBeInTheDocument();
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Successfully processed')).toBeInTheDocument();
    });

    it('should format field names with spaces', () => {
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      expect(screen.getByText('received At')).toBeInTheDocument();
      expect(screen.getByText('processing Notes')).toBeInTheDocument();
    });

    it('should display long text in scrollable container', () => {
      const itemWithLongHtml = {
        ...mockItem,
        html: 'a'.repeat(300),
      };
      render(<DataReceivedDetails item={itemWithLongHtml} onClose={vi.fn()} />);
      
      // Verify long text is displayed
      expect(screen.getByText(/a{100,}/)).toBeInTheDocument();
    });

    it('should not display undefined or null fields', () => {
      const itemWithoutNotes = { ...mockItem, processingNotes: undefined };
      render(<DataReceivedDetails item={itemWithoutNotes} onClose={vi.fn()} />);
      
      expect(screen.queryByText('processing Notes')).not.toBeInTheDocument();
    });

    it('should have close button', () => {
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      expect(screen.getByText('×')).toBeInTheDocument();
    });

    it('should have reprocess button', () => {
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      const reprocessButton = screen.getByTitle('Reprocess');
      expect(reprocessButton).toBeInTheDocument();
    });
  });

  describe('When item is null', () => {
    it('should render nothing', () => {
      const { container } = render(<DataReceivedDetails item={null} onClose={vi.fn()} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('When closing the modal', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<DataReceivedDetails item={mockItem} onClose={onClose} />);
      
      await user.click(screen.getByText('×'));
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const { container } = render(<DataReceivedDetails item={mockItem} onClose={onClose} />);
      
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<DataReceivedDetails item={mockItem} onClose={onClose} />);
      
      const content = screen.getByText('Details').closest('div');
      if (content) {
        await user.click(content);
        expect(onClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('When reprocessing an item', () => {
    it('should call API to create reprocessing event', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'event-id' }),
      });
      
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      const reprocessButton = screen.getByTitle('Reprocess');
      await user.click(reprocessButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/event',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'processHtml',
              payload: {
                dataReceivedId: mockItem.id,
                url: mockItem.url,
                title: mockItem.title,
              },
            }),
          })
        );
      });
    });

    it('should show spinning icon while reprocessing', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );
      
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      const reprocessButton = screen.getByTitle('Reprocess');
      await user.click(reprocessButton);
      
      const svg = reprocessButton.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });

    it('should disable button while reprocessing', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );
      
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      const reprocessButton = screen.getByTitle('Reprocess');
      await user.click(reprocessButton);
      
      expect(reprocessButton).toBeDisabled();
    });

    it('should show success alert on successful reprocessing', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'event-id' }),
      });
      
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      const reprocessButton = screen.getByTitle('Reprocess');
      await user.click(reprocessButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Reprocessing triggered successfully');
      });
    });

    it('should show error alert on failed reprocessing', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });
      
      render(<DataReceivedDetails item={mockItem} onClose={vi.fn()} />);
      
      const reprocessButton = screen.getByTitle('Reprocess');
      await user.click(reprocessButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to trigger reprocessing');
      });
    });
  });
});
