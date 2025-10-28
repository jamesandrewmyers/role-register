import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValueMappingWorkspace from '../ValueMappingWorkspace';

// Mock the components
vi.mock('@/components/HtmlViewer', () => ({
  default: ({ html, onMapElement }: any) => (
    <div data-testid="html-viewer" className="w-full h-full">
      <button onClick={() => onMapElement?.('h1.test-selector')}>
        Map Element
      </button>
      <div>{html && 'HTML Content'}</div>
    </div>
  ),
}));

vi.mock('@/components/ValueMappingForm', () => ({
  default: ({ cssSelector, onSave, onReset }: any) => (
    <div data-testid="mapping-form" className="w-full h-full">
      <div>Selector: {cssSelector}</div>
      <select
        data-testid="site-select"
        onChange={(e) => {
          if (e.target.value) {
            onSave({
              valueSite: e.target.value,
              valueEntity: 'roleListing',
              valueEntityProperty: 'title',
              cssSelector,
              selectorOrder: 1,
            });
          }
        }}
      >
        <option value="">Select site...</option>
        <option value="indeed.com">indeed.com</option>
      </select>
      <button onClick={onReset}>Reset</button>
    </div>
  ),
}));

describe('ValueMappingWorkspace', () => {
  const mockOnSaveMapping = vi.fn().mockResolvedValue(undefined);
  const sampleHtml = '<div><h1>Test</h1></div>';

  const defaultProps = {
    html: sampleHtml,
    mappings: [],
    onSaveMapping: mockOnSaveMapping,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('layout', () => {
    it('should render with 70/30 split layout', () => {
      const { container } = render(<ValueMappingWorkspace {...defaultProps} />);
      const htmlViewer = container.querySelector('[data-testid="html-viewer"]');

      expect(htmlViewer).toBeInTheDocument();
      // Form is only rendered when a selector is selected
      expect(container.querySelector('.w-\\[30\\%\\]')).toBeInTheDocument();
    });

    it('should have vertical divider between sections', () => {
      const { container } = render(<ValueMappingWorkspace {...defaultProps} />);
      const divider = container.querySelector('.w-1.bg-gray-300');
      expect(divider).toBeInTheDocument();
    });

    it('should display HtmlViewer on left side (70%)', () => {
      const { container } = render(<ValueMappingWorkspace {...defaultProps} />);
      const htmlViewerParent = container.querySelector('.w-\\[70\\%\\]');
      expect(htmlViewerParent).toBeInTheDocument();
    });

    it('should display form section on right side (30%)', () => {
      const { container } = render(<ValueMappingWorkspace {...defaultProps} />);
      const formParent = container.querySelector('.w-\\[30\\%\\]');
      expect(formParent).toBeInTheDocument();
    });
  });

  describe('initial state', () => {
    it('should display HtmlViewer content', () => {
      render(<ValueMappingWorkspace {...defaultProps} />);
      expect(screen.getByText('HTML Content')).toBeInTheDocument();
    });

    it('should display mapping form in default state', () => {
      render(<ValueMappingWorkspace {...defaultProps} />);
      expect(screen.getByTestId('mapping-form')).toBeInTheDocument();
    });

    it('should display form with empty selector initially', () => {
      render(<ValueMappingWorkspace {...defaultProps} />);
      expect(screen.getByText(/^Selector:/)).toBeInTheDocument();
    });
  });

  describe('selector selection', () => {
    it('should update form selector when element is selected', async () => {
      const user = userEvent.setup();
      render(<ValueMappingWorkspace {...defaultProps} />);

      expect(screen.getByText(/^Selector:$/)).toBeInTheDocument();

      const mapButton = screen.getByText('Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByText(/Selector: h1.test-selector/)).toBeInTheDocument();
      });
    });
  });

  describe('mapping save functionality', () => {
    it('should call onSaveMapping with form data', async () => {
      const user = userEvent.setup();
      render(<ValueMappingWorkspace {...defaultProps} />);

      const mapButton = screen.getByText('Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByTestId('mapping-form')).toBeInTheDocument();
      });

      const siteSelect = screen.getByTestId('site-select');
      await user.selectOptions(siteSelect, 'indeed.com');

      await waitFor(() => {
        expect(mockOnSaveMapping).toHaveBeenCalledWith(
          expect.objectContaining({
            valueSite: 'indeed.com',
            valueEntity: 'roleListing',
            valueEntityProperty: 'title',
            cssSelector: 'h1.test-selector',
          })
        );
      });
    });

    it('should reset form after successful save', async () => {
      const user = userEvent.setup();
      render(<ValueMappingWorkspace {...defaultProps} />);

      const mapButton = screen.getByText('Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByText('Selector: h1.test-selector')).toBeInTheDocument();
      });

      const siteSelect = screen.getByTestId('site-select');
      await user.selectOptions(siteSelect, 'indeed.com');

      await waitFor(() => {
        expect(mockOnSaveMapping).toHaveBeenCalled();
      });

      // Form should be reset to empty selector
      await waitFor(() => {
        expect(screen.getByText(/^Selector:$/)).toBeInTheDocument();
      });
    });
  });

  describe('form reset', () => {
    it('should clear form selector when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<ValueMappingWorkspace {...defaultProps} />);

      const mapButton = screen.getByText('Map Element');
      await user.click(mapButton);

      await waitFor(() => {
        expect(screen.getByText(/Selector: h1.test-selector/)).toBeInTheDocument();
      });

      const resetButton = screen.getByText('Reset');
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText(/^Selector:$/)).toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when loading prop is true', () => {
      render(<ValueMappingWorkspace {...defaultProps} loading={true} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not show form or empty state when loading', () => {
      render(<ValueMappingWorkspace {...defaultProps} loading={true} />);
      expect(screen.queryByTestId('mapping-form')).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Right-click an element in the HTML viewer/i)
      ).not.toBeInTheDocument();
    });

    it('should show form when loading is false', () => {
      render(<ValueMappingWorkspace {...defaultProps} loading={false} />);
      expect(screen.getByTestId('mapping-form')).toBeInTheDocument();
    });
  });

  describe('html updates', () => {
    it('should update html content when props change', () => {
      const { rerender } = render(<ValueMappingWorkspace {...defaultProps} />);
      expect(screen.getByText('HTML Content')).toBeInTheDocument();

      const newHtml = '<div><h2>New Content</h2></div>';
      rerender(<ValueMappingWorkspace {...defaultProps} html={newHtml} />);

      expect(screen.getByText('HTML Content')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = render(<ValueMappingWorkspace {...defaultProps} />);
      const main = container.querySelector('.flex.h-full');
      expect(main).toBeInTheDocument();
    });
  });

  describe('component separation', () => {
    it('HtmlViewer should not know about form state', async () => {
      const user = userEvent.setup();
      render(<ValueMappingWorkspace {...defaultProps} />);

      // HTML viewer should always be visible and interactive
      const mapButton = screen.getByText('Map Element');
      expect(mapButton).toBeInTheDocument();

      await user.click(mapButton);

      // Button should still be there after selection
      expect(screen.getByText('Map Element')).toBeInTheDocument();
    });

    it('Form should only depend on cssSelector input', async () => {
      const user = userEvent.setup();
      render(<ValueMappingWorkspace {...defaultProps} />);

      // Form is always present
      const form = screen.getByTestId('mapping-form');
      expect(within(form).getByText(/^Selector:$/)).toBeInTheDocument();

      const mapButton = screen.getByText('Map Element');
      await user.click(mapButton);

      // Form selector updates independently
      await waitFor(() => {
        expect(within(form).getByText(/Selector: h1.test-selector/)).toBeInTheDocument();
      });
    });
  });
});
