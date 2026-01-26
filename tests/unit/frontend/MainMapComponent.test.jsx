import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainMapComponent from '../../../frontend/src/Components/MainMapComponent/MainMapComponent.jsx';

describe('MainMapComponent', () => {
  beforeEach(() => {
    navigator.geolocation.getCurrentPosition.mockReset();
    navigator.geolocation.watchPosition.mockReset();
  });

  test('renders map container and initial marker', () => {
    render(<MainMapComponent />);

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

    render(<MainMapComponent />);

    const locateBtn = screen.getByRole('button');
    fireEvent.click(locateBtn);

    await waitFor(() => {
      const updatedMarker = screen.getAllByTestId('marker');
      expect(updatedMarker.length).toBeGreaterThan(0);
    });

    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
  });
});
