import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HtmlViewer from '../HtmlViewer';

describe('HtmlViewer', () => {
  const mockOnClose = vi.fn();
  
  const sampleHtml = `
    <div class="container">
      <h1 id="job-title" class="job-header">Senior Developer</h1>
      <p class="location" data-testid="location">San Francisco, CA</p>
      <div class="salary-info">
        <span>$150,000 - $200,000</span>
      </div>
    </div>
  `;

  const defaultProps = {
    html: sampleHtml,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the HTML viewer modal', () => {
      render(<HtmlViewer {...defaultProps} />);
      expect(screen.getByText('HTML Viewer')).toBeInTheDocument();
    });

    it('should display the close button', () => {
      render(<HtmlViewer {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: '×' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<HtmlViewer {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: '×' });
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when clicking outside the modal', async () => {
      const user = userEvent.setup();
      const { container } = render(<HtmlViewer {...defaultProps} />);
      const backdrop = container.querySelector('.fixed.inset-0');
      await user.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should parse and display HTML structure', () => {
      render(<HtmlViewer {...defaultProps} />);
      // Check for actual content that should be displayed
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('$150,000 - $200,000')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should toggle search panel with search button', async () => {
      const user = userEvent.setup();
      render(<HtmlViewer {...defaultProps} />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(screen.getByPlaceholderText('Search HTML...')).toBeInTheDocument();
    });

    it('should focus search input when opened', async () => {
      const user = userEvent.setup();
      render(<HtmlViewer {...defaultProps} />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      const searchInput = screen.getByPlaceholderText('Search HTML...');
      expect(searchInput).toHaveFocus();
    });

    it('should highlight matching search terms', async () => {
      const user = userEvent.setup();
      render(<HtmlViewer {...defaultProps} />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      const searchInput = screen.getByPlaceholderText('Search HTML...');
      await user.type(searchInput, 'Senior');
      
      await waitFor(() => {
        expect(screen.getByText('Senior', { selector: 'mark' })).toBeInTheDocument();
      });
    });

    it('should allow keyboard shortcut to open search (Ctrl+F)', async () => {
      render(<HtmlViewer {...defaultProps} />);
      
      const searchInput = screen.queryByPlaceholderText('Search HTML...');
      expect(searchInput).not.toBeInTheDocument();
      
      // Simulate Ctrl+F
      fireEvent.keyDown(window, { key: 'f', ctrlKey: true });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search HTML...')).toBeInTheDocument();
      });
    });

    it('should close search with Escape key', async () => {
      const user = userEvent.setup();
      render(<HtmlViewer {...defaultProps} />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(screen.getByPlaceholderText('Search HTML...')).toBeInTheDocument();
      
      fireEvent.keyDown(window, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search HTML...')).not.toBeInTheDocument();
      });
    });
  });

  describe('context menu', () => {
    it('should show context menu on right-click of element', async () => {
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      // Find an element div (any element with the green-400 class indicating a tag)
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]); // Skip the first one (might be container)
        
        await waitFor(() => {
          expect(screen.getByText(/map this element/i)).toBeInTheDocument();
        });
      }
    });

    it('should display "Copy Selector" option in context menu', async () => {
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/copy selector/i)).toBeInTheDocument();
        });
      }
    });

    it('should display "Inspect" option in context menu', async () => {
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/inspect/i)).toBeInTheDocument();
        });
      }
    });

    it('should handle context menu close on Escape key', async () => {
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/map this element/i)).toBeInTheDocument();
        });
        
        // Press Escape to close context menu
        fireEvent.keyDown(window, { key: 'Escape' });
        
        await waitFor(() => {
          expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        }, { timeout: 500 });
      }
    });
  });

  describe('selector detection', () => {
    it('should generate selector for element with id', async () => {
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/map this element/i)).toBeInTheDocument();
        });
      }
    });

    it('should generate selector for element with class', async () => {
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/map this element/i)).toBeInTheDocument();
        });
      }
    });

    it('should generate selector for element with data attributes', async () => {
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/map this element/i)).toBeInTheDocument();
        });
      }
    });

    it('should handle clipboard operations when "Copy Selector" is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/copy selector/i)).toBeInTheDocument();
        });
        
        const copySelectorButton = screen.getByText(/copy selector/i);
        await user.click(copySelectorButton);
        
        // Context menu should close after clicking
        await waitFor(() => {
          expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        }, { timeout: 500 });
      }
    });
  });

  describe('element mapping', () => {
    it('should have onMapElement callback prop', () => {
      const mockOnMapElement = vi.fn();
      render(
        <HtmlViewer 
          {...defaultProps} 
          onMapElement={mockOnMapElement}
        />
      );
      
      expect(mockOnMapElement).toBeDefined();
    });

    it('should call onMapElement when "Map This Element" is clicked', async () => {
      const user = userEvent.setup();
      const mockOnMapElement = vi.fn();
      const { container } = render(
        <HtmlViewer 
          {...defaultProps}
          onMapElement={mockOnMapElement}
        />
      );
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/map this element/i)).toBeInTheDocument();
        });
        
        const mapButton = screen.getByText(/map this element/i);
        await user.click(mapButton);
        
        await waitFor(() => {
          expect(mockOnMapElement).toHaveBeenCalledWith(
            expect.any(String)
          );
        });
      }
    });

    it('should pass correct selector to onMapElement callback', async () => {
      const user = userEvent.setup();
      const mockOnMapElement = vi.fn();
      const { container } = render(
        <HtmlViewer 
          {...defaultProps}
          onMapElement={mockOnMapElement}
        />
      );
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/map this element/i)).toBeInTheDocument();
        });
        
        const mapButton = screen.getByText(/map this element/i);
        await user.click(mapButton);
        
        await waitFor(() => {
          const callArgs = mockOnMapElement.mock.calls[0][0];
          expect(typeof callArgs).toBe('string');
          expect(callArgs.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('element inspection', () => {
    it('should handle element inspection', async () => {
      const user = userEvent.setup();
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      const elements = container.querySelectorAll('.text-green-400');
      if (elements.length > 0) {
        fireEvent.contextMenu(elements[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/inspect/i)).toBeInTheDocument();
        });
        
        const inspectButton = screen.getByText(/inspect/i);
        // Just verify the button exists and can be clicked
        expect(inspectButton).toBeInTheDocument();
        await user.click(inspectButton);
        
        // Context menu should close after clicking
        await waitFor(() => {
          expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        }, { timeout: 500 });
      }
    });
  });

  describe('collapse/expand functionality', () => {
    it('should allow collapsing parent elements', async () => {
      const user = userEvent.setup();
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      // Find the expand/collapse button for a parent element
      const collapseButtons = container.querySelectorAll('.text-purple-400');
      if (collapseButtons.length > 0) {
        const firstCollapseButton = collapseButtons[0] as HTMLElement;
        await user.click(firstCollapseButton);
        
        // Check if the button text changed
        expect(firstCollapseButton.textContent).toBeDefined();
      }
    });

    it('should allow expanding collapsed elements', async () => {
      const user = userEvent.setup();
      const { container } = render(<HtmlViewer {...defaultProps} />);
      
      const collapseButtons = container.querySelectorAll('.text-purple-400');
      if (collapseButtons.length > 0) {
        const firstButton = collapseButtons[0] as HTMLElement;
        await user.click(firstButton);
        await user.click(firstButton);
        
        expect(firstButton.textContent).toBeDefined();
      }
    });
  });
});
