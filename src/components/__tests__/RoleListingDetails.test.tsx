import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import RoleListingDetails from '../RoleListingDetails';

const mockListing = {
  id: 'test-id-123',
  title: 'Senior Software Engineer',
  description: 'Test job description',
  capturedAt: '1704067200',
  company: {
    id: 'company-1',
    name: 'Test Company',
    website: 'https://test.com',
  },
  location: {
    id: 'location-1',
    city: 'Portland',
    locationState: {
      id: 'state-1',
      name: 'Oregon',
      abbreviation: 'OR',
      createdAt: 1704067200,
    },
    createdAt: 1704067200,
  },
};

describe('RoleListingDetails', () => {
  describe('When rendered as a modal', () => {
    it('should display all fields by default', () => {
      const onClose = vi.fn();
      render(<RoleListingDetails listing={mockListing} onClose={onClose} />);
      
      expect(screen.getByText('test-id-123')).toBeInTheDocument();
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Test job description')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText('Portland, OR')).toBeInTheDocument();
    });

    it('should display a close button', () => {
      const onClose = vi.fn();
      render(<RoleListingDetails listing={mockListing} onClose={onClose} />);
      
      const closeButton = screen.getByText('×');
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RoleListingDetails listing={mockListing} onClose={onClose} />);
      
      const closeButton = screen.getByText('×');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const { container } = render(<RoleListingDetails listing={mockListing} onClose={onClose} />);
      
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should display modal header with title', () => {
      const onClose = vi.fn();
      render(<RoleListingDetails listing={mockListing} onClose={onClose} />);
      
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  describe('When rendered inline', () => {
    it('should not display modal wrapper when inline is true', () => {
      const onClose = vi.fn();
      const { container } = render(
        <RoleListingDetails listing={mockListing} onClose={onClose} inline={true} />
      );
      
      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).not.toBeInTheDocument();
    });

    it('should still render content when inline', () => {
      const onClose = vi.fn();
      render(<RoleListingDetails listing={mockListing} onClose={onClose} inline={true} />);
      
      expect(screen.getByText('test-id-123')).toBeInTheDocument();
    });
  });

  describe('When using field configuration', () => {
    it('should only display configured fields', () => {
      const onClose = vi.fn();
      const fieldConfig = {
        id: true,
        title: false,
        description: false,
        company: false,
        location: false,
        capturedAt: true,
      };
      
      render(
        <RoleListingDetails 
          listing={mockListing} 
          onClose={onClose} 
          fieldConfig={fieldConfig}
        />
      );
      
      expect(screen.getByText('test-id-123')).toBeInTheDocument();
      expect(screen.queryByText('Senior Software Engineer')).not.toBeInTheDocument();
      expect(screen.queryByText('Test job description')).not.toBeInTheDocument();
    });

    it('should display fields in compact mode', () => {
      const onClose = vi.fn();
      const fieldConfig = {
        id: true,
        capturedAt: true,
        compact: true,
      };
      
      render(
        <RoleListingDetails 
          listing={mockListing} 
          onClose={onClose} 
          fieldConfig={fieldConfig}
        />
      );
      
      expect(screen.getByText(/id:/i)).toBeInTheDocument();
    });
  });

  describe('When listing is null', () => {
    it('should not render anything', () => {
      const onClose = vi.fn();
      const { container } = render(<RoleListingDetails listing={null} onClose={onClose} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('When company information is missing', () => {
    it('should not display company field', () => {
      const listingWithoutCompany = { ...mockListing, company: null };
      const onClose = vi.fn();
      render(<RoleListingDetails listing={listingWithoutCompany} onClose={onClose} />);
      
      expect(screen.queryByText('Test Company')).not.toBeInTheDocument();
    });
  });

  describe('When location information is missing', () => {
    it('should not display location field', () => {
      const listingWithoutLocation = { ...mockListing, location: null };
      const onClose = vi.fn();
      render(<RoleListingDetails listing={listingWithoutLocation} onClose={onClose} />);
      
      expect(screen.queryByText('Portland, OR')).not.toBeInTheDocument();
    });
  });

  describe('When description is very long', () => {
    it('should display long descriptions in a scrollable container', () => {
      const longDescription = 'a'.repeat(300);
      const listingWithLongDesc = { ...mockListing, description: longDescription };
      const onClose = vi.fn();
      const { container } = render(
        <RoleListingDetails listing={listingWithLongDesc} onClose={onClose} />
      );
      
      const scrollableContainer = container.querySelector('.overflow-x-auto');
      expect(scrollableContainer).toBeInTheDocument();
    });
  });
});
