// MapComponent.js
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import "./MapComponent.css";

const MapComponent = () => {
  const [selectedState, setSelectedState] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Dummy data for testing
  const stateData = {
    CA: { devices: null, interactions: null },
    NY: { devices: null, interactions: null },
    // Additional states as needed
  };

  const handleStateClick = (event, geo) => {
    const stateCode = geo.properties.STUSPS || geo.properties.iso_3166_2 || geo.properties.name;
    setSelectedState(stateCode);

    // Position the tooltip near the mouse click, with bounds-checking
    const offset = 15;
    const { clientX, clientY } = event;
    const x = Math.min(clientX + offset, window.innerWidth - 100);
    const y = Math.min(clientY + offset, window.innerHeight - 80);

    setTooltipPosition({ x, y });
  };

  return (
    <div className="map-container">
      <h2 className="map-title">US Device Map</h2>
      <ComposableMap
        projection="geoAlbersUsa"
        width={800}
        height={500}
      >
        <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={(event) => handleStateClick(event, geo)}
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
        <div
          className="tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y
          }}
        >
          <h3>{selectedState}</h3>
          <p>Devices: {stateData[selectedState]?.devices ?? "N/A"}</p>
          <p>Relay Interactions: {stateData[selectedState]?.interactions ?? "N/A"}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
