// MapComponent.js
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const MapComponent = () => {
  const [selectedState, setSelectedState] = useState(null);

  // Dummy data with null values for initial testing
  const stateData = {
    CA: { devices: null, interactions: null },
    NY: { devices: null, interactions: null },
    // Additional states can be added here
  };

  const handleStateClick = (stateCode) => {
    setSelectedState(stateCode);
  };

  return (
    <div>
      <ComposableMap>
        <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleStateClick(geo.properties.STUSPS)}
                style={{
                  default: { fill: "#D6D6DA", outline: "none" },
                  hover: { fill: "#F53", outline: "none" },
                  pressed: { fill: "#E42", outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
      {selectedState && (
        <div className="state-info">
          <h3>{selectedState}</h3>
          <p>Devices: {stateData[selectedState]?.devices ?? "N/A"}</p>
          <p>Relay Interactions: {stateData[selectedState]?.interactions ?? "N/A"}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
