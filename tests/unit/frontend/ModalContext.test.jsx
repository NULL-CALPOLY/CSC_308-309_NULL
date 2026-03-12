import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  ModalProvider,
  useModal,
} from '../../../frontend/src/Components/ModalContext.jsx';

// Test consumer component
function TestConsumer() {
  const { showSignIn, showRegister, openSignIn, openRegister, closeAll } =
    useModal();
  return (
    <div>
      <div data-testid="sign-in-state">{showSignIn ? 'open' : 'closed'}</div>
      <div data-testid="register-state">{showRegister ? 'open' : 'closed'}</div>
      <button onClick={openSignIn}>Open Sign In</button>
      <button onClick={openRegister}>Open Register</button>
      <button onClick={closeAll}>Close All</button>
    </div>
  );
}

describe('ModalContext', () => {
  it('provides initial state with both modals closed', () => {
    render(
      <ModalProvider>
        <TestConsumer />
      </ModalProvider>
    );
    expect(screen.getByTestId('sign-in-state').textContent).toBe('closed');
    expect(screen.getByTestId('register-state').textContent).toBe('closed');
  });

  it('opens sign in modal and closes register', () => {
    render(
      <ModalProvider>
        <TestConsumer />
      </ModalProvider>
    );
    fireEvent.click(screen.getByText('Open Sign In'));
    expect(screen.getByTestId('sign-in-state').textContent).toBe('open');
    expect(screen.getByTestId('register-state').textContent).toBe('closed');
  });

  it('opens register modal and closes sign in', () => {
    render(
      <ModalProvider>
        <TestConsumer />
      </ModalProvider>
    );
    fireEvent.click(screen.getByText('Open Sign In'));
    fireEvent.click(screen.getByText('Open Register'));
    expect(screen.getByTestId('sign-in-state').textContent).toBe('closed');
    expect(screen.getByTestId('register-state').textContent).toBe('open');
  });

  it('closes all modals', () => {
    render(
      <ModalProvider>
        <TestConsumer />
      </ModalProvider>
    );
    fireEvent.click(screen.getByText('Open Sign In'));
    fireEvent.click(screen.getByText('Close All'));
    expect(screen.getByTestId('sign-in-state').textContent).toBe('closed');
    expect(screen.getByTestId('register-state').textContent).toBe('closed');
  });

  it('toggles correctly between sign in and register', () => {
    render(
      <ModalProvider>
        <TestConsumer />
      </ModalProvider>
    );
    fireEvent.click(screen.getByText('Open Register'));
    expect(screen.getByTestId('register-state').textContent).toBe('open');
    fireEvent.click(screen.getByText('Open Sign In'));
    expect(screen.getByTestId('sign-in-state').textContent).toBe('open');
    expect(screen.getByTestId('register-state').textContent).toBe('closed');
  });

  it('renders children', () => {
    render(
      <ModalProvider>
        <div data-testid="child">Child Content</div>
      </ModalProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
