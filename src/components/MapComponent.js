import React, { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { database, get, ref } from "./firebase.js";
import { getStateByZip } from "./stateZipRanges.js";
import "./MapComponent.css"

const MapComponent = () => {
  const [stateData, setStateData] = useState({});
  const [selectedState, setSelectedState] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const stateCounts = {};
  
      try {
        const snapshot = await get(ref(database, "controllers"));
        if (snapshot.exists()) {
          snapshot.forEach((controller) => {
            const data = controller.val();
            const zip = data.zip;
            const relayInteractions = data.relayInteractions || 0;
  
            if (zip !== undefined) {
              const state = getStateByZip(zip);
              if (state) {
                if (!stateCounts[state]) {
                  stateCounts[state] = { devices: 0, interactions: 0 };
                }
                stateCounts[state].devices += 1;
                stateCounts[state].interactions += relayInteractions;
              } else {
                console.warn(`No state found for zip code: ${zip}`);
              }
            }
          });
  
          console.log("Final state data:", stateCounts); 
          setStateData(stateCounts);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();

    // Add event listener to detect outside clicks
    const handleClickOutside = (event) => {
      if (mapContainerRef.current && !mapContainerRef.current.contains(event.target)) {
        setSelectedState(null); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleContainerClick = (event) => {
    if (event.target === mapContainerRef.current) {
      setSelectedState(null); 
    }
  };

  const handleStateClick = (event, geo) => {
    console.log("geo.properties:", geo.properties);
    const stateCode = geo.properties.STUSPS || geo.properties.name || geo.properties.state || geo.properties.STATE_ABBR; 
    console.log("State clicked:", stateCode);
    setSelectedState(stateCode);
    setTooltipPosition({ x: event.clientX + 15, y: event.clientY + 15 });
  };
  
  return (
    <div ref={mapContainerRef} className="map-container" onClick={handleContainerClick}>
      <ComposableMap
        projection="geoAlbersUsa"
        width={1000}
        height={600}
      >
        <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const data = stateData[stateName];

              let baseColor;
              if (data) {
                baseColor = data.interactions > 10 ? "#FF0000" : "#00FF00"; // Red for high interactions, green for devices
              } else {
                baseColor = "#D6D6DA"; // Default color if no data
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={(event) => handleStateClick(event, geo)}
                  style={{
                    default: { fill: baseColor, outline: "none", transition: "fill 0.3s ease" },
                    hover: {
                      fill: data
                        ? data.interactions > 10
                          ? "#CC0000" 
                          : "#00AA00" 
                        : "#B0B0B0", 
                    },
                    pressed: {
                      fill: data
                        ? data.interactions > 10
                          ? "#990000" 
                          : "#007700"
                        : "#808080", 
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
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

      {/* Legend */}
      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: "#FF0000" }}></span>
          <span>Unstable Grid</span>
        </div>
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: "#00FF00" }}></span>
          <span>Active Devices</span>
        </div>
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: "#D6D6DA" }}></span>
          <span>No Devices in State</span>
        </div>
      </div>

    </div>
  );
};

export default MapComponent;
