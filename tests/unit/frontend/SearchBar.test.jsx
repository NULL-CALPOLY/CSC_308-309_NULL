import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('../../../frontend/src/Hooks/UseInterests.jsx', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    interests: [{ name: 'Music' }, { name: 'Tech' }, { name: 'Sports' }],
    loading: false,
    error: null,
  })),
}));

// Mock Cloudscape Checkbox as simple checkbox
jest.mock('@cloudscape-design/components/checkbox', () => ({
  __esModule: true,
  default: ({ checked, onChange, children }) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange({ detail: { checked: e.target.checked } })}
        data-testid={`checkbox-${children}`}
      />
      {children}
    </label>
  ),
}));

import SearchBar from '../../../frontend/src/Components/SearchBar/SearchBar.jsx';

const renderSearchBar = (props = {}) => {
  const defaultProps = {
    onSelectionChange: jest.fn(),
    onDateChange: jest.fn(),
  };
  return render(<SearchBar {...defaultProps} {...props} />);
};

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the interest search input', () => {
    renderSearchBar();
    expect(
      screen.getByPlaceholderText('Search interests…')
    ).toBeInTheDocument();
  });

  it('renders all interest pills', () => {
    renderSearchBar();
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();
  });

  it('filters interests by search term', () => {
    renderSearchBar();
    fireEvent.change(screen.getByPlaceholderText('Search interests…'), {
      target: { value: 'mu' },
    });
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.queryByText('Tech')).not.toBeInTheDocument();
    expect(screen.queryByText('Sports')).not.toBeInTheDocument();
  });

  it('calls onSelectionChange with selected interests when pill is clicked', () => {
    const onSelectionChange = jest.fn();
    renderSearchBar({ onSelectionChange });
    fireEvent.click(screen.getByText('Music'));
    expect(onSelectionChange).toHaveBeenCalledWith(['Music']);
  });

  it('calls onSelectionChange with empty array when pill is clicked again', () => {
    const onSelectionChange = jest.fn();
    renderSearchBar({ onSelectionChange });
    fireEvent.click(screen.getByText('Tech'));
    fireEvent.click(screen.getByText('Tech'));
    const lastCall =
      onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
    expect(lastCall).not.toContain('Tech');
  });

  it('renders From and To date inputs', () => {
    renderSearchBar();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('calls onDateChange when start date changes', () => {
    const onDateChange = jest.fn();
    renderSearchBar({ onDateChange });
    const inputs = screen.getAllByDisplayValue('');
    // date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });
    expect(onDateChange).toHaveBeenCalledWith({
      startDate: '2025-01-01',
      endDate: '',
    });
  });

  it('calls onDateChange when end date changes', () => {
    const onDateChange = jest.fn();
    renderSearchBar({ onDateChange });
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[1], { target: { value: '2025-01-31' } });
    expect(onDateChange).toHaveBeenCalledWith({
      startDate: '',
      endDate: '2025-01-31',
    });
  });

  it('shows Clear button after a date is selected', () => {
    renderSearchBar();
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('clears dates when Clear is clicked', () => {
    const onDateChange = jest.fn();
    renderSearchBar({ onDateChange });
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });
    fireEvent.click(screen.getByText('Clear'));
    expect(onDateChange).toHaveBeenLastCalledWith({
      startDate: '',
      endDate: '',
    });
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('renders Filter by date label', () => {
    renderSearchBar();
    expect(screen.getByText('Date range')).toBeInTheDocument();
  });
});
