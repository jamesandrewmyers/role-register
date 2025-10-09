import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import RoleListingMainView from '../RoleListingMainView';

const mockListing = {
  id: 'test-id-123',
  title: 'Senior Software Engineer',
  description: '<p>Test job description</p>',
  capturedAt: '1704067200',
  companyId: 'company-1',
  company: {
    id: 'company-1',
    name: 'Test Company',
    website: 'https://test.com',
  },
  location: {
    id: 'location-1',
    city: 'Portland',
    stateName: 'Oregon',
    locationState: 'OR',
  },
  status: 'Applied',
  appliedAt: 1704067200,
};

describe('RoleListingMainView', () => {
  describe('When the user views a role listing', () => {
    it('should display the job title', async () => {
      render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
      });
    });

    it('should display the company name', async () => {
      render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Company')).toBeInTheDocument();
      });
    });

    it('should display the location', async () => {
      render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Portland, OR')).toBeInTheDocument();
      });
    });

    it('should render the job description as HTML', async () => {
      render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        const descriptionContainer = screen.getByText(/Test job description/i).parentElement;
        expect(descriptionContainer?.innerHTML).toContain('<p>Test job description</p>');
      });
    });

    it('should display the captured date', async () => {
      render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Captured:/)).toBeInTheDocument();
      });
    });
  });

  describe('When the user interacts with the split divider', () => {
    it('should have a draggable divider', async () => {
      const { container } = render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        const divider = container.querySelector('.cursor-col-resize');
        expect(divider).toBeInTheDocument();
      });
    });
  });

  describe('When the user interacts with collapsible sections', () => {
    it('should show Details section by default', async () => {
      render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument();
      });
    });

    it('should collapse Details section when header is clicked', async () => {
      const user = userEvent.setup();
      render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument();
      });
      
      const detailsHeader = screen.getByText('Details').closest('.cursor-pointer');
      expect(detailsHeader).toBeInTheDocument();
      
      if (detailsHeader) {
        await user.click(detailsHeader);
        const downArrow = screen.getAllByText('▼');
        expect(downArrow.length).toBeGreaterThan(0);
      }
    });

    it('should show Listing Events section by default', async () => {
      render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        expect(screen.getByText('Listing Events')).toBeInTheDocument();
      });
    });

    it('should have a button to add new events', async () => {
      render(<RoleListingMainView listing={mockListing} />);
      
      await waitFor(() => {
        const addButton = screen.getByTitle('Add Event');
        expect(addButton).toBeInTheDocument();
        expect(addButton).toHaveTextContent('+');
      });
    });
  });

  describe('When the listing has no company', () => {
    it('should not display company information', async () => {
      const listingWithoutCompany = { ...mockListing, company: null };
      render(<RoleListingMainView listing={listingWithoutCompany} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Test Company')).not.toBeInTheDocument();
      });
    });
  });

  describe('When the listing has no location', () => {
    it('should not display location information', async () => {
      const listingWithoutLocation = { ...mockListing, location: null };
      render(<RoleListingMainView listing={listingWithoutLocation} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Portland, OR')).not.toBeInTheDocument();
      });
    });
  });

  describe('When sidebar children are provided', () => {
    it('should render the sidebar children', async () => {
      const sidebarContent = <div data-testid="sidebar-test">Test Sidebar</div>;
      render(<RoleListingMainView listing={mockListing} sidebarChildren={sidebarContent} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sidebar-test')).toBeInTheDocument();
        expect(screen.getByText('Test Sidebar')).toBeInTheDocument();
      });
    });
  });
});
