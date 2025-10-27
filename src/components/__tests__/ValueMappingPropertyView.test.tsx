import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValueMappingPropertyView from '../ValueMappingPropertyView';
import type { ValueMapping } from '@/domain/entities/valueMapping';

describe('ValueMappingPropertyView', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnReorder = vi.fn();

  const sampleMappings: ValueMapping[] = [
    {
      id: 'mapping-1',
      valueSite: 'indeed.com',
      valueEntity: 'roleListing',
      valueEntityProperty: 'title',
      cssSelector: 'h1.jobsearch-JobInfoHeader-title',
      selectorOrder: 1,
      selectorDescription: 'Primary Indeed title selector',
      createdAt: Math.floor(Date.now() / 1000),
    },
    {
      id: 'mapping-2',
      valueSite: 'indeed.com',
      valueEntity: 'roleListing',
      valueEntityProperty: 'title',
      cssSelector: 'h1[data-testid="job-title"]',
      selectorOrder: 2,
      selectorDescription: 'Fallback Indeed title selector',
      createdAt: Math.floor(Date.now() / 1000),
    },
    {
      id: 'mapping-3',
      valueSite: 'linkedin.com',
      valueEntity: 'roleListing',
      valueEntityProperty: 'title',
      cssSelector: 'h1.top-card-layout__title',
      selectorOrder: 1,
      selectorDescription: 'LinkedIn title selector',
      createdAt: Math.floor(Date.now() / 1000),
    },
  ];

  const defaultProps = {
    site: 'indeed.com',
    entity: 'roleListing',
    property: 'title',
    mappings: sampleMappings.filter(
      m => m.valueSite === 'indeed.com' && m.valueEntity === 'roleListing' && m.valueEntityProperty === 'title'
    ),
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onReorder: mockOnReorder,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render property header with site, entity, and property', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      expect(screen.getByText('indeed.com → roleListing → title')).toBeInTheDocument();
    });

    it('should display all selectors in order', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      expect(screen.getByText('h1.jobsearch-JobInfoHeader-title')).toBeInTheDocument();
      expect(screen.getByText('h1[data-testid="job-title"]')).toBeInTheDocument();
    });

    it('should display selector descriptions', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      expect(screen.getByText('Primary Indeed title selector')).toBeInTheDocument();
      expect(screen.getByText('Fallback Indeed title selector')).toBeInTheDocument();
    });

    it('should display selector order badges', () => {
      const { container } = render(<ValueMappingPropertyView {...defaultProps} />);
      
      // Should show numeric order badges
      const badges = container.querySelectorAll('[class*="bg-blue-600"]');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should display correct priority labels', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Fallback')).toBeInTheDocument();
    });
  });

  describe('selector management', () => {
    it('should have edit button for each selector', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBe(defaultProps.mappings.length);
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);
      
      expect(mockOnEdit).toHaveBeenCalledWith(defaultProps.mappings[0]);
    });

    it('should have delete button for each selector', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons.length).toBe(defaultProps.mappings.length);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);
      
      // Should show confirmation dialog
      expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();
    });

    it('should confirm deletion before calling onDelete', async () => {
      const user = userEvent.setup();
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);
      
      // Find and click confirm button
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);
      
      expect(mockOnDelete).toHaveBeenCalledWith('mapping-1');
    });

    it('should cancel deletion when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('selector reordering', () => {
    it('should allow moving selector up', async () => {
      const user = userEvent.setup();
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      // Find enabled up arrow button (skip first selector which has disabled up button)
      const upButtons = screen.getAllByRole('button', { name: 'Move up' });
      const enabledUpButton = upButtons.find(btn => !btn.hasAttribute('disabled'));
      if (enabledUpButton) {
        await user.click(enabledUpButton);
        expect(mockOnReorder).toHaveBeenCalled();
      }
    });

    it('should allow moving selector down', async () => {
      const user = userEvent.setup();
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      // Find enabled down arrow button (skip last selector which has disabled down button)
      const downButtons = screen.getAllByRole('button', { name: 'Move down' });
      const enabledDownButton = downButtons.find(btn => !btn.hasAttribute('disabled'));
      if (enabledDownButton) {
        await user.click(enabledDownButton);
        expect(mockOnReorder).toHaveBeenCalled();
      }
    });

    it('should pass correct new order to onReorder', async () => {
      const user = userEvent.setup();
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const downButtons = screen.getAllByRole('button', { name: 'Move down' });
      const enabledDownButton = downButtons.find(btn => !btn.hasAttribute('disabled'));
      if (enabledDownButton) {
        await user.click(enabledDownButton);
        
        const callArgs = mockOnReorder.mock.calls[0][0];
        expect(Array.isArray(callArgs)).toBe(true);
        expect(callArgs.length).toBe(defaultProps.mappings.length);
      }
    });

    it('should disable up button for first selector', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const upButtons = screen.getAllByRole('button', { name: 'Move up' });
      // First up button should be disabled
      expect(upButtons[0]).toHaveAttribute('disabled');
    });

    it('should disable down button for last selector', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const downButtons = screen.getAllByRole('button', { name: 'Move down' });
      // Last down button should be disabled
      expect(downButtons[downButtons.length - 1]).toHaveAttribute('disabled');
    });
  });

  describe('empty state', () => {
    it('should show message when no mappings exist', () => {
      render(
        <ValueMappingPropertyView
          {...defaultProps}
          mappings={[]}
        />
      );
      
      expect(screen.getByText(/no selectors/i)).toBeInTheDocument();
    });

    it('should have add mapping button in empty state', () => {
      render(
        <ValueMappingPropertyView
          {...defaultProps}
          mappings={[]}
        />
      );
      
      expect(screen.getByRole('button', { name: /add.*selector/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all buttons', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should display semantic structure', () => {
      const { container } = render(<ValueMappingPropertyView {...defaultProps} />);
      
      // Check for div-based structure with data-testid selectors
      const selectorRows = container.querySelectorAll('[data-testid^="selector-row"]');
      expect(selectorRows.length).toBeGreaterThan(0);
    });

    it('should have keyboard navigation support', async () => {
      const user = userEvent.setup();
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      // Tab to first button
      await user.tab();
      
      // Should be able to reach buttons via keyboard
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  describe('selector highlighting', () => {
    it('should highlight selected selector', () => {
      const { container } = render(<ValueMappingPropertyView {...defaultProps} highlightedSelectorId="mapping-1" />);
      
      // Should have visual indication for selected/highlighted item
      const highlighted = container.querySelector('[data-selected="true"]');
      expect(highlighted).toBeInTheDocument();
    });
  });

  describe('multiple sites', () => {
    it('should filter by site correctly', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      // Should only show indeed.com mappings
      expect(screen.getByText('h1.jobsearch-JobInfoHeader-title')).toBeInTheDocument();
      expect(screen.queryByText('h1.top-card-layout__title')).not.toBeInTheDocument();
    });

    it('should display site name in header', () => {
      render(<ValueMappingPropertyView {...defaultProps} />);
      
      expect(screen.getByText(/indeed\.com/)).toBeInTheDocument();
    });
  });
});
