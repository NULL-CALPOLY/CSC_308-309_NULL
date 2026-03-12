import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteAccountModal from '../../../frontend/src/Components/DeleteAccountModal/DeleteAccountModal.jsx';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  isDeleting: false,
};

describe('DeleteAccountModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<DeleteAccountModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Delete Account')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(<DeleteAccountModal {...defaultProps} />);
    expect(screen.getByText('Delete Account')).toBeInTheDocument();
  });

  it('shows warning text', () => {
    render(<DeleteAccountModal {...defaultProps} />);
    expect(screen.getByText(/permanent and irreversible/i)).toBeInTheDocument();
  });

  it('shows the DELETE confirmation instruction', () => {
    render(<DeleteAccountModal {...defaultProps} />);
    expect(screen.getByText(/Type/i)).toBeInTheDocument();
  });

  it('cancel button calls onClose', () => {
    render(<DeleteAccountModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('delete button is disabled when input does not match DELETE', () => {
    render(<DeleteAccountModal {...defaultProps} />);
    const deleteBtn = screen.getByText('Delete My Account');
    expect(deleteBtn).toBeDisabled();
  });

  it('delete button becomes enabled when DELETE is typed', () => {
    render(<DeleteAccountModal {...defaultProps} />);
    const input = screen.getByPlaceholderText('DELETE');
    fireEvent.change(input, { target: { value: 'DELETE' } });
    const deleteBtn = screen.getByText('Delete My Account');
    expect(deleteBtn).not.toBeDisabled();
  });

  it('calls onConfirm when DELETE is typed and button clicked', () => {
    render(<DeleteAccountModal {...defaultProps} />);
    const input = screen.getByPlaceholderText('DELETE');
    fireEvent.change(input, { target: { value: 'DELETE' } });
    fireEvent.click(screen.getByText('Delete My Account'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('converts typed text to uppercase', () => {
    render(<DeleteAccountModal {...defaultProps} />);
    const input = screen.getByPlaceholderText('DELETE');
    fireEvent.change(input, { target: { value: 'delete' } });
    expect(input.value).toBe('DELETE');
  });

  it('shows spinner when isDeleting is true', () => {
    render(<DeleteAccountModal {...defaultProps} isDeleting={true} />);
    const input = screen.getByPlaceholderText('DELETE');
    fireEvent.change(input, { target: { value: 'DELETE' } });
    // spinner is a span element
    const { container } = render(
      <DeleteAccountModal {...defaultProps} isDeleting={true} />
    );
    expect(container.querySelector('.dam-spinner')).toBeInTheDocument();
  });

  it('clicking backdrop calls onClose', () => {
    const { container } = render(<DeleteAccountModal {...defaultProps} />);
    const backdrop = container.querySelector('.dam-backdrop');
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('clicking modal content does not call onClose (stopPropagation)', () => {
    const { container } = render(<DeleteAccountModal {...defaultProps} />);
    const modal = container.querySelector('.dam-modal');
    fireEvent.click(modal);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('clears input when modal closes and reopens', () => {
    const { rerender } = render(<DeleteAccountModal {...defaultProps} />);
    const input = screen.getByPlaceholderText('DELETE');
    fireEvent.change(input, { target: { value: 'DELETE' } });
    expect(input.value).toBe('DELETE');

    rerender(<DeleteAccountModal {...defaultProps} isOpen={false} />);
    rerender(<DeleteAccountModal {...defaultProps} isOpen={true} />);
    // After reopening, input should be cleared
    const newInput = screen.getByPlaceholderText('DELETE');
    expect(newInput.value).toBe('');
  });

  it('does not call onConfirm when input is partial', () => {
    render(<DeleteAccountModal {...defaultProps} />);
    const input = screen.getByPlaceholderText('DELETE');
    fireEvent.change(input, { target: { value: 'DEL' } });
    // Try clicking - but button is disabled, so onConfirm shouldn't be called
    const deleteBtn = screen.getByText('Delete My Account');
    expect(deleteBtn).toBeDisabled();
  });
});
