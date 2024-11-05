import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { database } from "./firebase"; // Ensure this points to your firebase setup
import { get, ref } from "firebase/database";
import { getStateByZip } from "./stateZipRanges"; // Ensure this is correctly imported

const MapComponent = () => {
  const [stateCounts, setStateCounts] = useState({});
  const [selectedState, setSelectedState] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleStateClick = (event, geo) => {
    const stateCode = geo.properties.STUSPS || geo.properties.name || geo.properties.state || geo.properties.STATE_ABBR;
    console.log("State clicked:", stateCode);
    setSelectedState(stateCode);
    setTooltipPosition({ x: event.clientX + 15, y: event.clientY + 15 });
  };

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
  
                console.log(`Updated stateCounts for ${state}:`, stateCounts[state]);
              } else {
                console.warn(`No state found for zip code: ${zip}`);
              }
            } else {
              console.warn("Missing zip field in controller data:", data);
            }
          });
  
          console.log("Final state data:", stateCounts);
          setStateCounts(stateCounts);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <div>
      <h1>US Device Map</h1>
      <ComposableMap width={1500} height={800}>
        <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"> {/* Use the CDN link here */}
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={handleStateClick}
                style={{
                  default: { fill: "#D6D6DA", outline: "none" },
                  hover: { fill: "#FF5722", outline: "none" },
                  pressed: { fill: "#FF8C00", outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>

      {selectedState && stateCounts[selectedState] && (
  <div
    className="tooltip"
    style={{
      left: tooltipPosition.x,
      top: tooltipPosition.y,
      position: "absolute",
      background: "white",
      border: "1px solid black",
      padding: "5px",
      borderRadius: "3px",
    }}
  >
    <h3>{selectedState}</h3>
    <p>Devices: {stateCounts[selectedState]?.devices ?? "N/A"}</p>
    <p>Relay Interactions: {stateCounts[selectedState]?.interactions ?? "N/A"}</p>
  </div>
)}

    </div>
  );
};

export default MapComponent;
