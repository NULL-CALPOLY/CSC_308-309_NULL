import React from 'react';

// Passthrough mock: render children directly so cluster contents (markers)
// are still queryable in tests without pulling in leaflet.markercluster.
export default function MarkerClusterGroup({ children }) {
  return <div data-testid="marker-cluster-group">{children}</div>;
}
