import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../frontend/src/Hooks/UseAuth.ts', () => ({
  useAuth: jest.fn(),
  AuthContext: { Provider: ({ children }) => children },
  useProvideAuth: jest.fn(),
}));

jest.mock('../../../frontend/src/Components/ModalContext.jsx', () => ({
  useModal: jest.fn(() => ({ openSignIn: jest.fn() })),
  ModalProvider: ({ children }) => children,
}));

jest.mock(
  '../../../frontend/src/Components/MainMapComponent/MainMapComponent.jsx',
  () => ({
    __esModule: true,
    default: () => <div data-testid="map">Map</div>,
  })
);

jest.mock(
  '../../../frontend/src/Components/EventColumn/EventColumn.jsx',
  () => ({
    __esModule: true,
    default: ({ onRefetchReady }) => {
      if (onRefetchReady) onRefetchReady(jest.fn());
      return <div data-testid="event-column">EventColumn</div>;
    },
  })
);

jest.mock(
  '../../../frontend/src/Components/CreateEventButton/CreateEventButton.jsx',
  () => ({
    __esModule: true,
    default: ({ onClick, label }) => (
      <button data-testid="create-event-btn" onClick={onClick}>
        {label}
      </button>
    ),
  })
);

jest.mock(
  '../../../frontend/src/Components/CreateEventModal/CreateEventModal.jsx',
  () => ({
    __esModule: true,
    default: ({ isOpen, onClose }) =>
      isOpen ? (
        <div data-testid="create-event-modal">
          <button onClick={onClose}>Close Modal</button>
        </div>
      ) : null,
  })
);

jest.mock('../../../frontend/src/Components/Navbar/Navbar.jsx', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('../../../frontend/src/assets/Hamburger.svg', () => 'Hamburger.svg', {
  virtual: true,
});
jest.mock('../../../frontend/src/assets/Arrow.svg', () => 'Arrow.svg', {
  virtual: true,
});

const { useAuth } = require('../../../frontend/src/Hooks/UseAuth.ts');
const {
  useModal,
} = require('../../../frontend/src/Components/ModalContext.jsx');

import HomePage from '../../../frontend/src/Pages/Home/HomePage.jsx';

const renderHomePage = (authOverrides = {}) => {
  useAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    loading: false,
    ...authOverrides,
  });
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // default window width to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders the Navbar', () => {
    renderHomePage();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders the map', () => {
    renderHomePage();
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('renders the event column', () => {
    renderHomePage();
    expect(screen.getByTestId('event-column')).toBeInTheDocument();
  });

  it('renders Create Event button with correct label when user exists', () => {
    renderHomePage({ user: { id: 'u1', name: 'Alice' } });
    expect(screen.getByTestId('create-event-btn')).toHaveTextContent(
      'Create Event'
    );
  });

  it('renders "Sign In" label when no user', () => {
    renderHomePage({ user: null });
    expect(screen.getByTestId('create-event-btn')).toHaveTextContent(
      'Sign In'
    );
  });

  it('opens create event modal when button is clicked and user is logged in', () => {
    renderHomePage({ user: { id: 'u1', name: 'Alice' } });
    fireEvent.click(screen.getByTestId('create-event-btn'));
    expect(screen.getByTestId('create-event-modal')).toBeInTheDocument();
  });

  it('calls openSignIn when button is clicked and no user', () => {
    const mockOpenSignIn = jest.fn();
    useModal.mockReturnValue({ openSignIn: mockOpenSignIn });
    renderHomePage({ user: null });
    fireEvent.click(screen.getByTestId('create-event-btn'));
    expect(mockOpenSignIn).toHaveBeenCalled();
  });

  it('closes create event modal when Close Modal is clicked', () => {
    renderHomePage({ user: { id: 'u1', name: 'Alice' } });
    fireEvent.click(screen.getByTestId('create-event-btn'));
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('create-event-modal')).not.toBeInTheDocument();
  });

  it('renders hamburger button to open panel', () => {
    renderHomePage();
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', { value: 500 });
    fireEvent.resize(window);
    expect(screen.getByLabelText('Open event panel')).toBeInTheDocument();
  });

  it('renders close panel button', () => {
    renderHomePage();
    expect(screen.getByLabelText('Close event panel')).toBeInTheDocument();
  });

  it('closes the event column when close button is clicked', () => {
    renderHomePage();
    const closeBtn = screen.getByLabelText('Close event panel');
    fireEvent.click(closeBtn);
    // Hamburger open button should now be accessible
    expect(screen.getByLabelText('Open event panel')).toBeInTheDocument();
  });
});
