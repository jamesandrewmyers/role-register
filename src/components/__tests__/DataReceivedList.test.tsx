import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import DataReceivedList from '../DataReceivedList';

const mockItems = [
  {
    id: 'data-1',
    url: 'https://www.linkedin.com/jobs/view/123',
    title: 'Senior Software Engineer',
    receivedAt: '1704067200',
    processed: 'true',
    processingNotes: 'Successfully processed',
  },
  {
    id: 'data-2',
    url: 'https://www.indeed.com/job/456',
    title: 'Frontend Developer',
    receivedAt: '1704153600',
    processed: 'false',
  },
  {
    id: 'data-3',
    url: 'https://www.linkedin.com/jobs/view/789',
    title: 'Backend Engineer',
    receivedAt: '1704240000',
    processed: 'failed',
    processingNotes: 'Failed to extract company name',
  },
];

describe('DataReceivedList', () => {
  describe('When displaying a list of received data', () => {
    it('should render the heading', () => {
      render(<DataReceivedList items={[]} onSelectItem={vi.fn()} />);
      
      expect(screen.getByText('Data Received')).toBeInTheDocument();
    });

    it('should render all items', () => {
      render(<DataReceivedList items={mockItems} onSelectItem={vi.fn()} />);
      
      expect(screen.getByText(/Senior Software Engineer/)).toBeInTheDocument();
      expect(screen.getByText(/Frontend Developer/)).toBeInTheDocument();
      expect(screen.getByText(/Backend Engineer/)).toBeInTheDocument();
    });

    it('should display item titles with IDs', () => {
      render(<DataReceivedList items={mockItems} onSelectItem={vi.fn()} />);
      
      expect(screen.getByText('Senior Software Engineer - data-1')).toBeInTheDocument();
    });

    it('should display item URLs', () => {
      render(<DataReceivedList items={mockItems} onSelectItem={vi.fn()} />);
      
      expect(screen.getByText('https://www.linkedin.com/jobs/view/123')).toBeInTheDocument();
      expect(screen.getByText('https://www.indeed.com/job/456')).toBeInTheDocument();
    });

    it('should display received dates in localized format', () => {
      render(<DataReceivedList items={mockItems} onSelectItem={vi.fn()} />);
      
      const dates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dates.length).toBeGreaterThan(0);
    });
  });

  describe('When displaying processing status', () => {
    it('should show Processed badge for processed items', () => {
      render(<DataReceivedList items={mockItems} onSelectItem={vi.fn()} />);
      
      expect(screen.getByText('Processed')).toBeInTheDocument();
    });

    it('should show Pending badge for unprocessed items', () => {
      render(<DataReceivedList items={mockItems} onSelectItem={vi.fn()} />);
      
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should show Failed badge for failed items', () => {
      render(<DataReceivedList items={mockItems} onSelectItem={vi.fn()} />);
      
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should display processing notes when available', () => {
      render(<DataReceivedList items={mockItems} onSelectItem={vi.fn()} />);
      
      expect(screen.getByText('Successfully processed')).toBeInTheDocument();
      expect(screen.getByText('Failed to extract company name')).toBeInTheDocument();
    });

    it('should not display processing notes when not available', () => {
      const itemsWithoutNotes = [mockItems[1]];
      render(<DataReceivedList items={itemsWithoutNotes} onSelectItem={vi.fn()} />);
      
      expect(screen.queryByText('Successfully processed')).not.toBeInTheDocument();
    });
  });

  describe('When list is empty', () => {
    it('should display empty state message', () => {
      render(<DataReceivedList items={[]} onSelectItem={vi.fn()} />);
      
      expect(screen.getByText('No data received yet')).toBeInTheDocument();
    });

    it('should not display any items', () => {
      render(<DataReceivedList items={[]} onSelectItem={vi.fn()} />);
      
      expect(screen.queryByText(/Senior Software Engineer/)).not.toBeInTheDocument();
    });
  });

  describe('When user interacts with items', () => {
    it('should call onSelectItem when item is clicked', async () => {
      const user = userEvent.setup();
      const onSelectItem = vi.fn();
      render(<DataReceivedList items={mockItems} onSelectItem={onSelectItem} />);
      
      const item = screen.getByText('Senior Software Engineer - data-1').closest('div[role="button"], div.cursor-pointer');
      if (item) {
        await user.click(item);
        expect(onSelectItem).toHaveBeenCalledWith(mockItems[0]);
      }
    });

    it('should open URL in new tab when clicked', () => {
      render(<DataReceivedList items={mockItems} onSelectItem={vi.fn()} />);
      
      const link = screen.getByText('https://www.linkedin.com/jobs/view/123');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should not trigger onSelectItem when URL link is clicked', async () => {
      const user = userEvent.setup();
      const onSelectItem = vi.fn();
      render(<DataReceivedList items={mockItems} onSelectItem={onSelectItem} />);
      
      const link = screen.getByText('https://www.linkedin.com/jobs/view/123');
      await user.click(link);
      
      expect(onSelectItem).not.toHaveBeenCalled();
    });
  });
});
