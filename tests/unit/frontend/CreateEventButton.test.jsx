import { render, screen, fireEvent } from '@testing-library/react';
import CreateEventButton from '../../../frontend/src/Components/CreateEventButton/CreateEventButton.jsx';

describe('CreateEventButton', () => {
  it('renders with default label', () => {
    render(<CreateEventButton onClick={jest.fn()} />);
    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<CreateEventButton onClick={jest.fn()} label="Add New Event" />);
    expect(screen.getByText('Add New Event')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<CreateEventButton onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders the SVG icon', () => {
    const { container } = render(<CreateEventButton onClick={jest.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the button with correct class', () => {
    const { container } = render(<CreateEventButton onClick={jest.fn()} />);
    expect(container.querySelector('.create-event-btn')).toBeInTheDocument();
  });
});
