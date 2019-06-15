// provide colors depending on the earthquake magnitude
function getColor(d)  {
  return d < 0  ? "green"    :
         d < 1  ? "#bcf33c"  :  
         d < 2  ? "#f9f291"  :
         d < 3  ? "#e6cc7a"  :
         d < 4  ? "#d3a663"  :
         d < 5  ? "#b97345"  :
                  "#800000";
}

function createMap(eqData)   {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 16,
    id: "mapbox.light",
    accessToken: API_KEY
  });
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 16,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = { "Light Map": lightmap,
                    "Satellite Map": satellitemap  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = { "Earthquakes": eqData  };

  // Create the map object with options
  var myMap = L.map("map-id", {
    center: [40, -109],
    zoom: 5,
    layers: [lightmap, eqData]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);

  // create a legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i]) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);

}



// Create the createMarkers function
function createMarkers(feats) {

  // for (i=0; i< feats.length; i++)  {
  //   console.log(i, features[i].geometry.coordinates[0], features[i].geometry.coordinates[1], features[i].properties.mag);
  // }

  console.log(feats);
  // Initialize an array to hold bike markers
  var eqMarkers = [];
  var markerRadius = 500;
  var magnitude = 0;
  var eqColor = "";

  // Loop through the stations array
  for (var i = 0; i < feats.length; i++)  {
    magnitude = feats[i].properties.mag; 

    if (magnitude < 0)  {
      markerRadius = 1;     // what exactly is an earthquake with negative magnitude anyway?
      eqColor = "green";
    }
    else {
      // markerRadius = 500 * (magnitude ** 3.3);
      markerRadius = 15000 * (magnitude ** 1.3);
      eqColor = getColor(magnitude);
    }
    
    console.log(magnitude, markerRadius, eqColor);

    // For each earthquake, create a marker and bind a popup with the station's name
    
    marker = L.circle([feats[i].geometry.coordinates[1], feats[i].geometry.coordinates[0]],  {
      color: "#707070",
      weight: 1,
      fillColor: eqColor,
      fillOpacity: 0.85,
      radius: markerRadius
    }).bindPopup("<h1>Magnitude: " + magnitude + "</h1><hr><h2>" + feats[i].properties.place + "</h2>");
 
        // Add the marker to the eqMarkers array

    eqMarkers.push(marker);

  }
  // Create a layer group made from the eqMarkers array, pass it into the createMap function

  // special test earthquake
  // magnitude = 6.2;
  // eqColor = "#800000";
  // markerRadius = 15000 * (magnitude ** 1.3);
  
  // marker = L.circle([42, -95],  {
  //   color: "#606060",
  //   weight: 1,
  //   fillColor: eqColor,
  //   fillOpacity: 0.85,
  //   radius: markerRadius
  // }).bindPopup("<h1>Magnitude: " + magnitude + "</h1><h2>Special Test Earthquake - Iowa doesn't really have earthquakes</h2>");
  // eqMarkers.push(marker);
  // end special test earthquake



  var eqLayer = L.layerGroup(eqMarkers);
  createMap(eqLayer);
}

link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform an API call to the USGS API to get earthquake information. Call createMarkers when complete
d3.json(link, function(data) {
  features = data.features;
  createMarkers(features);

});


