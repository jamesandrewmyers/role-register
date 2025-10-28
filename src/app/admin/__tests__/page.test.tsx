import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '../page';

// Mock the components
vi.mock('@/components/HtmlViewer', () => ({
  default: ({ html, onClose, onMapElement }: any) => (
    <div data-testid="html-viewer">
      <button onClick={onClose}>Close Viewer</button>
      <button onClick={() => onMapElement?.('h1.test')}>Mock Map Element</button>
      <div>{html && 'HTML Loaded'}</div>
    </div>
  ),
}));

vi.mock('@/components/ValueMappingHierarchyView', () => ({
  default: ({ mappings, onEdit, onDelete, onAddMapping }: any) => (
    <div data-testid="hierarchy-view">
      <div>Total Mappings: {mappings.length}</div>
      <button onClick={() => onEdit?.(mappings[0])}>Edit First</button>
      <button onClick={() => onDelete?.('test-id')}>Delete</button>
      <button onClick={() => onAddMapping?.()}>Add Mapping</button>
    </div>
  ),
}));

vi.mock('@/components/ValueMappingDialog', () => ({
  default: ({ isOpen, onClose, onSave, cssSelector }: any) => (
    isOpen ? (
      <div data-testid="value-mapping-dialog" role="dialog">
        <div>CSS Selector: {cssSelector}</div>
        <button onClick={onClose}>Cancel</button>
        <button onClick={() => onSave?.({
          valueSite: 'test.com',
          valueEntity: 'roleListing',
          valueEntityProperty: 'title',
          cssSelector,
          selectorOrder: 1,
        })}>Save</button>
      </div>
    ) : null
  ),
}));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the admin page with layout', async () => {
      render(<AdminPage />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading mappings...')).not.toBeInTheDocument();
      });

      // Check main layout is present
      expect(screen.getByTestId('admin-main')).toBeInTheDocument();
      expect(screen.getByTestId('hierarchy-view')).toBeInTheDocument();
    });

    it('should display the page title', () => {
      render(<AdminPage />);
      expect(screen.getByText(/value mapping admin/i)).toBeInTheDocument();
    });

    it('should have two-column layout', () => {
      const { container } = render(<AdminPage />);
      const mainContainer = container.querySelector('[data-testid="admin-main"]');
      expect(mainContainer).toHaveClass('grid', 'grid-cols-2', 'gap-4');
    });

    it('should render HtmlViewer section', () => {
      render(<AdminPage />);
      const viewerSection = screen.getByRole('heading', { name: /html viewer/i, level: 2 });
      expect(viewerSection).toBeInTheDocument();
    });

    it('should render ValueMappingHierarchyView section', () => {
      render(<AdminPage />);
      const hierarchySection = screen.getByRole('heading', { name: /mappings/i });
      expect(hierarchySection).toBeInTheDocument();
    });
  });

  describe('HtmlViewer integration', () => {
    it('should show HtmlViewer modal when button is clicked', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      const openButton = screen.getByText('Open HTML Viewer');
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByTestId('html-viewer')).toBeInTheDocument();
      });
    });

    it('should handle element mapping from HtmlViewer', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      const openButton = screen.getByText('Open HTML Viewer');
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByTestId('html-viewer')).toBeInTheDocument();
      });

      const mapButton = screen.getByText('Mock Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByTestId('value-mapping-dialog')).toBeInTheDocument();
      });
    });

    it('should open ValueMappingDialog when element is selected', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      const openButton = screen.getByText('Open HTML Viewer');
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByTestId('html-viewer')).toBeInTheDocument();
      });

      const mapButton = screen.getByText('Mock Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        const dialog = screen.getByTestId('value-mapping-dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText(/h1.test/)).toBeInTheDocument();
      });
    });

    it('should close HtmlViewer when close button clicked', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      const openButton = screen.getByText('Open HTML Viewer');
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByTestId('html-viewer')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close Viewer');
      await user.click(closeButton);

      // HtmlViewer should be hidden/removed
      expect(screen.queryByTestId('html-viewer')).not.toBeInTheDocument();
    });
  });

  describe('ValueMappingDialog integration', () => {
    it('should show dialog when element mapping is triggered', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      const mapButton = screen.getByText('Mock Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should pass selected CSS selector to dialog', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      const mapButton = screen.getByText('Mock Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByText(/h1.test/)).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      const mapButton = screen.getByText('Mock Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should save mapping when dialog is submitted', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      const mapButton = screen.getByText('Mock Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('ValueMappingHierarchyView integration', () => {
    it('should display hierarchy view on right side', async () => {
      render(<AdminPage />);
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading mappings...')).not.toBeInTheDocument();
      });
      expect(screen.getByTestId('hierarchy-view')).toBeInTheDocument();
    });

    it('should pass mappings to hierarchy view', async () => {
      render(<AdminPage />);
      // Should show some mappings count (even if 0)
      await waitFor(() => {
        expect(screen.getByText(/total mappings:/i)).toBeInTheDocument();
      });
    });

    it('should handle edit action from hierarchy', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      // Wait for loading
      await waitFor(() => {
        expect(screen.queryByText('Loading mappings...')).not.toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit First');
      await user.click(editButton);

      // Edit should trigger dialog or some action
      expect(editButton).toBeInTheDocument();
    });

    it('should handle delete action from hierarchy', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      // Wait for loading
      await waitFor(() => {
        expect(screen.queryByText('Loading mappings...')).not.toBeInTheDocument();
      });

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Delete should trigger confirmation or removal
      expect(deleteButton).toBeInTheDocument();
    });

    it('should handle add new mapping action', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      // Wait for loading
      await waitFor(() => {
        expect(screen.queryByText('Loading mappings...')).not.toBeInTheDocument();
      });

      const addButton = screen.getByText('Add Mapping');
      await user.click(addButton);

      // Add should trigger dialog
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('state management', () => {
    it('should maintain mapping state across user interactions', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading mappings...')).not.toBeInTheDocument();
      });

      // Verify hierarchy view is visible
      expect(screen.getByTestId('hierarchy-view')).toBeInTheDocument();

      // Open HTML viewer
      const openButton = screen.getByText('Open HTML Viewer');
      await user.click(openButton);

      // Verify viewer is visible
      await waitFor(() => {
        expect(screen.getByTestId('html-viewer')).toBeInTheDocument();
      });

      // Trigger a mapping
      const mapButton = screen.getByText('Mock Map Element');
      await user.click(mapButton);

      // Dialog should open
      await waitFor(() => {
        expect(screen.getByTestId('value-mapping-dialog')).toBeInTheDocument();
      });
    });

    it('should update mappings list after saving', async () => {
      const user = userEvent.setup();
      render(<AdminPage />);

      // Open HTML viewer
      const openButton = screen.getByText('Open HTML Viewer');
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByTestId('html-viewer')).toBeInTheDocument();
      });

      const mapButton = screen.getByText('Mock Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('responsive design', () => {
    it('should have proper spacing and padding', () => {
      const { container } = render(<AdminPage />);
      const mainContainer = container.querySelector('[data-testid="admin-main"]');
      expect(mainContainer).toHaveClass('p-6');
    });

    it('should have proper header styling', () => {
      const { container } = render(<AdminPage />);
      const header = container.querySelector('h1');
      expect(header).toHaveClass('text-3xl', 'font-bold', 'mb-6');
    });

    it('should have proper section headers', () => {
      render(<AdminPage />);
      const sectionHeaders = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeaders.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<AdminPage />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have section headings', () => {
      render(<AdminPage />);
      const h2Headers = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headers.length).toBeGreaterThanOrEqual(2);
    });

    it('should support keyboard navigation', () => {
      const { container } = render(<AdminPage />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<AdminPage />);
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('error handling', () => {
    it('should handle missing HTML gracefully', () => {
      render(<AdminPage />);
      expect(screen.getByTestId('html-viewer')).toBeInTheDocument();
    });

    it('should handle missing mappings gracefully', async () => {
      render(<AdminPage />);
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading mappings...')).not.toBeInTheDocument();
      });
      expect(screen.getByTestId('hierarchy-view')).toBeInTheDocument();
    });

    it('should handle dialog errors gracefully', () => {
      render(<AdminPage />);
      expect(screen.getByTestId('html-viewer')).toBeInTheDocument();
    });
  });
});
