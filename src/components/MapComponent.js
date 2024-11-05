// MapComponent.js
import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { database, get, ref } from "./firebase.js";
import { getStateByZip } from "./stateZipRanges.js";
import "./MapComponent.css";

const MapComponent = () => {
  const [stateData, setStateData] = useState({});
  const [selectedState, setSelectedState] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
  
          console.log("Final state data:", stateCounts); // Debugging line
          setStateData(stateCounts);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  
  
  
  
  const handleStateClick = (event, geo) => {
    console.log("geo.properties:", geo.properties); // Debugging line
    const stateCode = geo.properties.STUSPS || geo.properties.name || geo.properties.state || geo.properties.STATE_ABBR; 
    console.log("State clicked:", stateCode); // Debugging line
    setSelectedState(stateCode);
    setTooltipPosition({ x: event.clientX + 15, y: event.clientY + 15 });
  };
  
  
  return (
    <div className="map-container">
      <h2 className="map-title">US Device Map</h2>
      <ComposableMap
        projection="geoAlbersUsa"
        width={1500}
        height={800}
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
