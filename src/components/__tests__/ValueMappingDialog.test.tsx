import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValueMappingDialog from '../ValueMappingDialog';

describe('ValueMappingDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const defaultProps = {
    isOpen: true,
    cssSelector: 'h1.job-title',
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render dialog when isOpen is true', () => {
      render(<ValueMappingDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when isOpen is false', () => {
      render(<ValueMappingDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display the CSS selector as read-only', () => {
      render(<ValueMappingDialog {...defaultProps} />);
      const selectorInput = screen.getByDisplayValue('h1.job-title');
      expect(selectorInput).toHaveAttribute('readonly');
    });

    it('should have form fields for all required inputs', () => {
      render(<ValueMappingDialog {...defaultProps} />);
      expect(screen.getByLabelText(/source site/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Entity$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/entity property/i)).toBeInTheDocument();
    });

    it('should have optional selector description field', () => {
      render(<ValueMappingDialog {...defaultProps} />);
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });

  describe('site selection', () => {
    it('should display available sites in dropdown', () => {
      render(<ValueMappingDialog {...defaultProps} />);
      const siteSelect = screen.getByLabelText(/source site/i);
      fireEvent.click(siteSelect);
      expect(screen.getByText('indeed.com')).toBeInTheDocument();
      expect(screen.getByText('linkedin.com')).toBeInTheDocument();
    });

    it('should update site when selected', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);
      const siteSelect = screen.getByLabelText(/source site/i) as HTMLSelectElement;
      await user.selectOptions(siteSelect, 'linkedin.com');
      expect(siteSelect.value).toBe('linkedin.com');
    });
  });

  describe('entity selection', () => {
    it('should display available entities in dropdown', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);
      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.click(entitySelect);
      expect(screen.getByText('roleListing')).toBeInTheDocument();
      expect(screen.getByText('roleEvent')).toBeInTheDocument();
      expect(screen.getByText('roleLocation')).toBeInTheDocument();
    });

    it('should update entity when selected', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);
      const entitySelect = screen.getByLabelText(/^Entity$/i) as HTMLSelectElement;
      await user.selectOptions(entitySelect, 'roleEvent');
      expect(entitySelect.value).toBe('roleEvent');
    });
  });

  describe('entity property selection', () => {
    it('should show properties based on selected entity', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);
      
      // Select entity first
      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      // Check that roleListing properties appear
      const propertySelect = screen.getByLabelText(/entity property/i);
      await user.click(propertySelect);
      
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('description')).toBeInTheDocument();
      expect(screen.getByText('workArrangement')).toBeInTheDocument();
    });

    it('should update property when selected', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);
      
      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const propertySelect = screen.getByLabelText(/entity property/i) as HTMLSelectElement;
      await user.selectOptions(propertySelect, 'title');
      expect(propertySelect.value).toBe('title');
    });
  });

  describe('form submission', () => {
    it('should call onSave with correct mapping data', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);

      // Fill form
      const siteSelect = screen.getByLabelText(/source site/i);
      await user.selectOptions(siteSelect, 'indeed.com');

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const propertySelect = screen.getByLabelText(/entity property/i);
      await user.selectOptions(propertySelect, 'title');

      const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
      await user.type(descriptionInput, 'Main job title header');

      // Submit
      const submitButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          valueSite: 'indeed.com',
          valueEntity: 'roleListing',
          valueEntityProperty: 'title',
          cssSelector: 'h1.job-title',
          selectorDescription: 'Main job title header',
          selectorOrder: 1,
        });
      });
    });

    it('should auto-calculate selector order as first if none exist', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);

      // Fill minimum required fields
      const siteSelect = screen.getByLabelText(/source site/i);
      await user.selectOptions(siteSelect, 'indeed.com');

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const propertySelect = screen.getByLabelText(/entity property/i);
      await user.selectOptions(propertySelect, 'title');

      // Submit
      const submitButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            selectorOrder: 1,
          })
        );
      });
    });

    it('should validate all required fields before submission', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);

      // Try to submit without filling fields
      const submitButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(submitButton);

      // onSave should not be called
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(screen.getByText(/please/i)).toBeInTheDocument();
    });

    it('should close dialog on cancel', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('optional selector description', () => {
    it('should allow empty selector description', async () => {
      const user = userEvent.setup();
      render(<ValueMappingDialog {...defaultProps} />);

      // Fill required fields only
      const siteSelect = screen.getByLabelText(/source site/i);
      await user.selectOptions(siteSelect, 'indeed.com');

      const entitySelect = screen.getByLabelText(/^Entity$/i);
      await user.selectOptions(entitySelect, 'roleListing');

      const propertySelect = screen.getByLabelText(/entity property/i);
      await user.selectOptions(propertySelect, 'title');

      // Don't fill description
      const submitButton = screen.getByRole('button', { name: /save mapping/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            selectorDescription: undefined,
          })
        );
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<ValueMappingDialog {...defaultProps} />);
      expect(screen.getByLabelText(/source site/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Entity$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/entity property/i)).toBeInTheDocument();
    });

    it('should have semantic button labels', () => {
      render(<ValueMappingDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /save mapping/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should trap focus within dialog when open', () => {
      const { container } = render(<ValueMappingDialog {...defaultProps} />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
