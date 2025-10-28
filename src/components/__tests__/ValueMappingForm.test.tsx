import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValueMappingForm from '../ValueMappingForm';

describe('ValueMappingForm', () => {
  const mockOnSave = vi.fn();
  const mockOnReset = vi.fn();
  const defaultProps = {
    cssSelector: 'h1.job-title',
    onSave: mockOnSave,
    onReset: mockOnReset,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render form with title', () => {
      render(<ValueMappingForm {...defaultProps} />);
      expect(screen.getByText('Map HTML Element to Entity')).toBeInTheDocument();
    });

    it('should display CSS selector as read-only input', () => {
      render(<ValueMappingForm {...defaultProps} />);
      const input = screen.getByDisplayValue('h1.job-title');
      expect(input).toHaveAttribute('readonly');
    });

    it('should have form fields for site, entity, and property', () => {
      render(<ValueMappingForm {...defaultProps} />);
      expect(screen.getByLabelText(/source site/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Entity$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/entity property/i)).toBeInTheDocument();
    });

    it('should have optional description field', () => {
      render(<ValueMappingForm {...defaultProps} />);
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should have Save and Reset buttons', () => {
      render(<ValueMappingForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /save mapping/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });

  describe('form behavior', () => {
    it('should display available sites in dropdown', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);
      const siteSelect = screen.getByLabelText(/source site/i);
      await user.click(siteSelect);
      expect(screen.getByText('indeed.com')).toBeInTheDocument();
      expect(screen.getByText('linkedin.com')).toBeInTheDocument();
    });

    it('should display available entities in dropdown', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);
      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.click(entitySelect);
      expect(screen.getByText('roleListing')).toBeInTheDocument();
      expect(screen.getByText('roleEvent')).toBeInTheDocument();
    });

    it('should update entity properties based on selected entity', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const propertySelect = screen.getByLabelText(/entity property/i);
      await user.click(propertySelect);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('description')).toBeInTheDocument();
    });

    it('should disable property select when no entity is selected', () => {
      render(<ValueMappingForm {...defaultProps} />);
      const propertySelect = screen.getByLabelText(/entity property/i) as HTMLSelectElement;
      expect(propertySelect.disabled).toBe(true);
    });

    it('should enable property select when entity is selected', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const propertySelect = screen.getByLabelText(/entity property/i) as HTMLSelectElement;
      expect(propertySelect.disabled).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should validate site selection', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(saveButton);

      expect(screen.getByText(/please select a source site/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should validate entity selection', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const siteSelect = screen.getByLabelText(/source site/i);
      await user.selectOptions(siteSelect, 'indeed.com');

      const saveButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(saveButton);

      expect(screen.getByText(/please select an entity/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should validate entity property selection', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const siteSelect = screen.getByLabelText(/source site/i);
      await user.selectOptions(siteSelect, 'indeed.com');

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const saveButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(saveButton);

      expect(screen.getByText(/please select an entity property/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('should call onSave with correct mapping data', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const siteSelect = screen.getByLabelText(/source site/i);
      await user.selectOptions(siteSelect, 'indeed.com');

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const propertySelect = screen.getByLabelText(/entity property/i);
      await user.selectOptions(propertySelect, 'title');

      const saveButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.job-title',
        selectorDescription: undefined,
        selectorOrder: 1,
      });
    });

    it('should include optional description if provided', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const siteSelect = screen.getByLabelText(/source site/i);
      await user.selectOptions(siteSelect, 'indeed.com');

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const propertySelect = screen.getByLabelText(/entity property/i);
      await user.selectOptions(propertySelect, 'title');

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Main job title');

      const saveButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          selectorDescription: 'Main job title',
        })
      );
    });

    it('should clear form after successful save', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const siteSelect = screen.getByLabelText(/source site/i);
      await user.selectOptions(siteSelect, 'indeed.com');

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const propertySelect = screen.getByLabelText(/entity property/i);
      await user.selectOptions(propertySelect, 'title');

      const saveButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(saveButton);

      // Form should be cleared
      expect((siteSelect as HTMLSelectElement).value).toBe('');
      expect((entitySelect as HTMLSelectElement).value).toBe('');
      expect((propertySelect as HTMLSelectElement).value).toBe('');
    });
  });

  describe('form reset', () => {
    it('should call onReset when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalled();
    });

    it('should clear form fields when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const siteSelect = screen.getByLabelText(/source site/i);
      await user.selectOptions(siteSelect, 'indeed.com');

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect((siteSelect as HTMLSelectElement).value).toBe('');
      expect((entitySelect as HTMLSelectElement).value).toBe('');
    });

    it('should clear error messages when reset is clicked', async () => {
      const user = userEvent.setup();
      render(<ValueMappingForm {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(saveButton);

      expect(screen.getByText(/please select a source site/i)).toBeInTheDocument();

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(screen.queryByText(/please select a source site/i)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<ValueMappingForm {...defaultProps} />);
      expect(screen.getByLabelText(/source site/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Entity$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/entity property/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      // CSS selector is labeled but not associated with label element
      expect(screen.getByDisplayValue('h1.job-title')).toBeInTheDocument();
    });

    it('should have semantic button labels', () => {
      render(<ValueMappingForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /save mapping/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });

  describe('component independence', () => {
    it('should only depend on cssSelector input prop', () => {
      const { rerender } = render(<ValueMappingForm {...defaultProps} />);

      // Change selector
      rerender(
        <ValueMappingForm
          cssSelector="div.new-selector"
          onSave={mockOnSave}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByDisplayValue('div.new-selector');
      expect(input).toBeInTheDocument();
    });

    it('should only call provided callbacks', async () => {
      const user = userEvent.setup();
      const newOnSave = vi.fn();
      const newOnReset = vi.fn();

      render(
        <ValueMappingForm
          cssSelector={defaultProps.cssSelector}
          onSave={newOnSave}
          onReset={newOnReset}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(newOnReset).toHaveBeenCalled();
      expect(mockOnReset).not.toHaveBeenCalled();
    });
  });
});
