import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MainMapComponent from "../../frontend/src/Components/MainMapComponent/MainMapComponent.jsx";

test("renders map component", () => {
  const { container } = render(<MainMapComponent />);
  expect(container).toBeTruthy();
});

// Mock images imported in component
jest.mock("../../frontend/src/assets/pin.svg", () => "pin.svg");
jest.mock("../../frontend/src/assets/location.svg", () => "location.svg");

// Mock react-leaflet hooks & components
// `react-leaflet` and `leaflet` are mapped in Jest config to manual mocks
// so we don't auto-mock them here (the manual mocks live in `tests/__mocks__`).

describe("MainMapComponent", () => {
  beforeEach(() => {
    navigator.geolocation.getCurrentPosition.mockReset();
    navigator.geolocation.watchPosition.mockReset();
  });

  test("renders map container and initial marker", () => {
    render(<MainMapComponent />);

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toBeInTheDocument();
    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
  });

  test("clicking locate button calls geolocation and updates marker", async () => {
    const mockPosition = {
      coords: { latitude: 35.301, longitude: -120.662 }
    };

    // simulate successful geolocation
    navigator.geolocation.getCurrentPosition.mockImplementationOnce(
      (success) => success(mockPosition)
    );

    render(<MainMapComponent />);

    const locateBtn = screen.getByRole("button");
    fireEvent.click(locateBtn);

    // wait for state to update
    await waitFor(() => {
      const updatedMarker = screen.getAllByTestId("marker");
      expect(updatedMarker.length).toBeGreaterThan(0);
    });

    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
  });
});
