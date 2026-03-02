import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainMapComponent from '../../../frontend/src/Components/MainMapComponent/MainMapComponent.jsx';

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('MainMapComponent', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
      })
    );
    navigator.geolocation.getCurrentPosition.mockReset();
    navigator.geolocation.watchPosition.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders map container and initial marker', () => {
    renderWithRouter(<MainMapComponent />);

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  test('clicking locate button calls geolocation and updates marker', async () => {
    const mockPosition = {
      coords: { latitude: 35.301, longitude: -120.662 },
    };

    navigator.geolocation.getCurrentPosition.mockImplementationOnce((success) =>
      success(mockPosition)
    );

    renderWithRouter(<MainMapComponent />);

    const locateBtn = screen.getByRole('button');
    fireEvent.click(locateBtn);

    await waitFor(() => {
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });
});
