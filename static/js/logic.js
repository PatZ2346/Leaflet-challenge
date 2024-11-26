// Create the map object with a center and zoom level
var myMap = L.map("map", {
  center: [20.0, 5.0],
  zoom: 2
});

// Define base layers
var streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
});

var topoMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.opentopomap.org/copyright'>OpenTopoMap</a> contributors"
});

// Add streetMap to the map by default
streetMap.addTo(myMap);

// Base layers object for layer control
var baseMaps = {
  "Street Map": streetMap,
  "Topographic Map": topoMap
};

// Fetch the earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(earthquakeData) {

  // Function to determine marker size based on magnitude
  function markerSize(magnitude) {
    return magnitude * 4;
  }

  // Function to determine marker color based on depth
  function markerColor(depth) {
    return depth > 90 ? "#FF0000" :  // Red
           depth > 70 ? "#FFA500" :  // Orange
           depth > 50 ? "#FFFF00" :  // Yellow
           depth > 30 ? "#008000" :  // Green
           depth > 10 ? "#0000FF" :  // Blue
                        "#800080";   // Purple
  }

  // Create a GeoJSON layer for earthquakes
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
    }
  }).addTo(myMap);

  // Fetch tectonic plates data
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(tectonicData) {
    // Create a GeoJSON layer for tectonic plates
    var tectonicPlates = L.geoJSON(tectonicData, {
      style: {
        color: "yellow",
        weight: 2
      }
    }).addTo(myMap);

    // Overlay layers object for layer control
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

    // Add a legend
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var depths = [-10, 10, 30, 50, 70, 90];
      var colors = [
        "#800080",  // Purple
        "#0000FF",  // Blue
        "#008000",  // Green
        "#FFFF00",  // Yellow
        "#FFA500",  // Orange
        "#FF0000"   // Red
      ];

      // Loop through depth intervals to create labels with colored squares
      for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<div class="legend-item"><i style="background: ' + colors[i] + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+') + '</div>';
      }
      return div;
    };

    legend.addTo(myMap);
  });
});
