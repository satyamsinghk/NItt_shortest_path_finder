// // Initialize the map
// const map = L.map("map", { zoomControl: false }).setView(
//   [10.7592, 78.8138],
//   16
// ); // NIT Trichy coordinates
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   maxZoom: 19,
//   attribution: "© OpenStreetMap contributors",
// }).addTo(map);

// // User interaction markers
// let startMarker = null;
// let endMarker = null;
// const stopMarkers = [];
// let routeLayer = null;

// // Graph data (representing road connections in NIT Trichy for testing)
// const graph = {
//   A: { B: 4, C: 3 },
//   B: { A: 4, D: 2, E: 7 },
//   C: { A: 3, D: 1 },
//   D: { B: 2, C: 1, E: 5 },
//   E: { B: 7, D: 5 },
// };

// // Node coordinates
// const coordinates = {
//   A: [10.7601, 78.813],
//   B: [10.7595, 78.812],
//   C: [10.761, 78.8125],
//   D: [10.76, 78.8127],
//   E: [10.7585, 78.8129],
// };

// // Add a marker on the map
// function createMarker(lat, lng, color) {
//   return L.circleMarker([lat, lng], {
//     color: color,
//     radius: 8,
//     fillOpacity: 0.8,
//   }).addTo(map);
// }

// // Calculate the heuristic using Haversine distance
// function calculateHeuristic(coord1, coord2) {
//   const R = 6371e3; // Earth's radius in meters
//   const toRadians = (deg) => (deg * Math.PI) / 180;

//   const lat1 = toRadians(coord1[0]);
//   const lat2 = toRadians(coord2[0]);
//   const dLat = toRadians(coord2[0] - coord1[0]);
//   const dLng = toRadians(coord2[1] - coord1[1]);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// // Enhanced A* algorithm
// function enhancedAStar(graph, start, end, coordinates) {
//   const openSet = new Set([start]);
//   const cameFrom = {};
//   const gScore = {};
//   const fScore = {};

//   // Initialize scores
//   Object.keys(graph).forEach((node) => {
//     gScore[node] = Infinity;
//     fScore[node] = Infinity;
//   });

//   gScore[start] = 0;
//   fScore[start] = calculateHeuristic(coordinates[start], coordinates[end]);

//   while (openSet.size > 0) {
//     // Find node with the lowest fScore
//     let current = Array.from(openSet).reduce((a, b) =>
//       fScore[a] < fScore[b] ? a : b
//     );

//     // Goal reached
//     if (current === end) {
//       const path = [];
//       while (current in cameFrom) {
//         path.unshift(current);
//         current = cameFrom[current];
//       }
//       path.unshift(start);
//       return path;
//     }

//     openSet.delete(current);

//     for (const neighbor in graph[current]) {
//       const tentativeGScore = gScore[current] + graph[current][neighbor];

//       if (tentativeGScore < gScore[neighbor]) {
//         cameFrom[neighbor] = current;
//         gScore[neighbor] = tentativeGScore;
//         fScore[neighbor] =
//           gScore[neighbor] +
//           calculateHeuristic(coordinates[neighbor], coordinates[end]);

//         if (!openSet.has(neighbor)) {
//           openSet.add(neighbor);
//         }
//       }
//     }
//   }

//   return null; // No path found
// }

// // Map click events
// map.on("click", (e) => {
//   const { lat, lng } = e.latlng;

//   if (!startMarker) {
//     startMarker = createMarker(lat, lng, "green")
//       .bindPopup("Start")
//       .openPopup();
//   } else if (!endMarker) {
//     endMarker = createMarker(lat, lng, "red").bindPopup("End").openPopup();
//   } else {
//     stopMarkers.push(createMarker(lat, lng, "blue").bindPopup("Stop"));
//   }
// });

// // Reset functionality
// document.getElementById("resetButton").addEventListener("click", () => {
//   map.eachLayer((layer) => {
//     if (layer instanceof L.CircleMarker || layer === routeLayer) {
//       map.removeLayer(layer);
//     }
//   });

//   startMarker = null;
//   endMarker = null;
//   stopMarkers.length = 0;
//   routeLayer = null;
// });

// // Calculate path
// document.getElementById("calculateButton").addEventListener("click", () => {
//   if (!startMarker || !endMarker) {
//     alert("Select both start and end points.");
//     return;
//   }

//   const start = "A";
//   const end = "E";

//   const path = enhancedAStar(graph, start, end, coordinates);

//   if (path) {
//     alert(`Path: ${path.join(" → ")}`);
//     const routeCoordinates = path.map((node) => coordinates[node]);

//     if (routeLayer) {
//       map.removeLayer(routeLayer);
//     }
//     routeLayer = L.polyline(routeCoordinates, { color: "blue" }).addTo(map);
//   } else {
//     alert("No path found.");
//   }
// });

// Initialize the map
const map = L.map("map").setView([10.7592, 78.8138], 16); // NIT Trichy coordinates
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Markers for user selection
let startMarker = null;
let endMarker = null;
const stopMarkers = [];
let routeControl = null;

// Custom Marker Options
const markerOptions = {
  start: { color: "green", title: "Start Location" },
  stop: { color: "blue", title: "Stop Location" },
  end: { color: "red", title: "End Location" },
};

// Map click event handler
map.on("click", (e) => {
  const { lat, lng } = e.latlng;

  // Add start, stop, or end markers dynamically
  if (!startMarker) {
    startMarker = L.marker([lat, lng], {
      icon: createCustomIcon("green"),
    })
      .addTo(map)
      .bindPopup("<strong>Start Location</strong>")
      .openPopup();
  } else if (!endMarker) {
    endMarker = L.marker([lat, lng], { icon: createCustomIcon("red") })
      .addTo(map)
      .bindPopup("<strong>End Location</strong>")
      .openPopup();
  } else {
    const stopMarker = L.marker([lat, lng], {
      icon: createCustomIcon("blue"),
    })
      .addTo(map)
      .bindPopup("<strong>Stop Location</strong>")
      .openPopup();
    stopMarkers.push(stopMarker);
  }
});

// Custom Icon Generator
function createCustomIcon(color) {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff;"></div>`,
    iconSize: [20, 20],
  });
}

// Reset all selections
document.getElementById("resetButton").addEventListener("click", () => {
  startMarker?.remove();
  endMarker?.remove();
  stopMarkers.forEach((marker) => marker.remove());
  if (routeControl) {
    map.removeControl(routeControl);
  }
  startMarker = null;
  endMarker = null;
  stopMarkers.length = 0;
});

// Calculate the multi-stop path using Leaflet Routing Machine
document
  .getElementById("calculateButton")
  .addEventListener("click", async () => {
    if (!startMarker || !endMarker) {
      alert("Please select both start and end points.");
      return;
    }

    // Gather waypoints: Start -> Stops -> End
    const waypoints = [
      startMarker.getLatLng(),
      ...stopMarkers.map((marker) => marker.getLatLng()),
      endMarker.getLatLng(),
    ];

    try {
      // Clear previous route
      if (routeControl) {
        map.removeControl(routeControl);
      }

      // Use Leaflet Routing Machine to display the route
      routeControl = L.Routing.control({
        waypoints: waypoints,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
        show: true,
        routeWhileDragging: true,
        createMarker: function (i, waypoint) {
          const isStart = i === 0;
          const isEnd = i === waypoints.length - 1;
          const color = isStart ? "green" : isEnd ? "red" : "blue";
          return L.marker(waypoint.latLng, {
            icon: createCustomIcon(color),
          });
        },
      }).addTo(map);
    } catch (error) {
      console.error("Routing failed:", error);
      alert(
        "Routing failed. Please check your internet connection or OSRM service."
      );
    }
  });

// // Initialize the map without zoom controls
// const map = L.map("map", { zoomControl: false }).setView(
//   [10.7592, 78.8138],
//   16
// ); // NIT Trichy coordinates
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   maxZoom: 19,
//   attribution: "© OpenStreetMap contributors",
// }).addTo(map);

// // Markers for user selection
// let startMarker = null;
// let endMarker = null;
// const stopMarkers = [];
// let routePath = null;

// // Map click event handler
// map.on("click", (e) => {
//   const { lat, lng } = e.latlng;

//   // Add start, stop, or end markers dynamically
//   if (!startMarker) {
//     startMarker = L.marker([lat, lng], { icon: createCustomIcon("green") })
//       .addTo(map)
//       .bindPopup("<strong>Start Location</strong>")
//       .openPopup();
//   } else if (!endMarker) {
//     endMarker = L.marker([lat, lng], { icon: createCustomIcon("red") })
//       .addTo(map)
//       .bindPopup("<strong>End Location</strong>")
//       .openPopup();
//   } else {
//     const stopMarker = L.marker([lat, lng], { icon: createCustomIcon("blue") })
//       .addTo(map)
//       .bindPopup("<strong>Stop Location</strong>")
//       .openPopup();
//     stopMarkers.push(stopMarker);
//   }
// });

// // Reset all selections
// document.getElementById("resetButton").addEventListener("click", () => {
//   startMarker?.remove();
//   endMarker?.remove();
//   stopMarkers.forEach((marker) => marker.remove());
//   if (routePath) {
//     map.removeLayer(routePath);
//   }
//   startMarker = null;
//   endMarker = null;
//   stopMarkers.length = 0;
// });

// // Enhanced A* Algorithm Implementation
// function enhancedAStarAlgorithm(start, stops, end) {
//   const distance = (a, b) => {
//     const dx = a.lat - b.lat;
//     const dy = a.lng - b.lng;
//     return Math.sqrt(dx * dx + dy * dy);
//   };

//   const heuristic = (current, goal) => distance(current, goal);

//   const findPath = (start, stops, end) => {
//     const openSet = [start];
//     const cameFrom = new Map();
//     const gScore = new Map([[start, 0]]);
//     const fScore = new Map([[start, heuristic(start, end)]]);

//     while (openSet.length > 0) {
//       openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
//       const current = openSet.shift();

//       if (current === end) {
//         const path = [current];
//         let temp = current;
//         while (cameFrom.has(temp)) {
//           temp = cameFrom.get(temp);
//           path.unshift(temp);
//         }
//         return path;
//       }

//       for (const neighbor of stops.concat([end])) {
//         const tentativeGScore =
//           gScore.get(current) + distance(current, neighbor);
//         if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
//           cameFrom.set(neighbor, current);
//           gScore.set(neighbor, tentativeGScore);
//           fScore.set(neighbor, tentativeGScore + heuristic(neighbor, end));
//           if (!openSet.includes(neighbor)) {
//             openSet.push(neighbor);
//           }
//         }
//       }
//     }
//     return [];
//   };

//   return findPath(start, stops, end);
// }

// // Calculate the path
// document.getElementById("calculateButton").addEventListener("click", () => {
//   if (!startMarker || !endMarker) {
//     alert("Please select both start and end points.");
//     return;
//   }

//   const start = startMarker.getLatLng();
//   const end = endMarker.getLatLng();
//   const stops = stopMarkers.map((marker) => marker.getLatLng());

//   // Get path from Enhanced A* Algorithm
//   const path = enhancedAStarAlgorithm(start, stops, end);

//   if (path.length > 0) {
//     if (routePath) {
//       map.removeLayer(routePath);
//     }
//     routePath = L.polyline(path, { color: "blue", weight: 5 }).addTo(map);
//   } else {
//     alert("Pathfinding failed. Check inputs.");
//   }
// });

// // Custom Icon Generator
// function createCustomIcon(color) {
//   return L.divIcon({
//     className: "custom-icon",
//     html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff;"></div>`,
//     iconSize: [20, 20],
//   });
// }
