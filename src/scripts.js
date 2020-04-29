var data;
$.getJSON("https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/time-series.json", function (json) {
    data = json;
});


mapboxgl.accessToken = 'pk.eyJ1IjoiZ3NlcHVsdmVkYTk2IiwiYSI6ImNrNzlmaGFvNDBzcHozZG9kOXQxNjF0bW8ifQ.P4nx2cJHuZTio2JivJyBDA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-99.9, 41.5],
    zoom: 4
});
var hoveredStateId = null;

var popup = new mapboxgl.Popup({
    closeButton: false
});


map.on('load', function () {
    // Add source for state polygons hosted on Mapbox, based on US Census Data:
    // https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html
    map.addSource('counties-with-pops-f-8nbien', {
        type: 'vector',
        url: 'mapbox://gsepulveda96.aj2hpi11'
    });

    //console.log(data)

    var expression = ['match', ['get', 'fips']];

    //console.log(expression)
    // Calculate color for each state based on the unemployment rate
    data['04-28-2020'].forEach(function (row) {
        number = (row['infection_rate'])
        //var green = (row['infection_rate'] / 9967 ) * 255;
        //var color = 'rgba(' + 0 + ', ' + green + ', ' + 0 + ', 1)';

        var color = (number > 1000) ? "#AE8080" :
            (number > 500) ? "#D18080" :
            (number > 100) ? "#FC8B8B" :
            (number > 10) ? "#FDC4C4" :
            (number > 1) ? "#FDE6E6" :
            "#FFFFFF";

        expression.push(row['fips'], color);
    });

    // Last value is the default, used where there is no data
    expression.push('rgba(255,255,255,1)');

    // Add layer from the vector tile source with data-driven style
    map.addLayer({
            'id': 'states-join',
            'type': 'fill',
            'source': 'counties-with-pops-f-8nbien',
            'source-layer': 'counties-with-pops-f-8nbien',
            'paint': {
                'fill-color': expression,
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.5
                    ]
            }
        },
        'waterway-label'
    );

    map.on('mousemove', 'states-join', function(e) {

        if (e.features.length > 0) {
            if (hoveredStateId) {
            map.setFeatureState(
            { source: 'counties-with-pops-f-8nbien', sourceLayer: 'counties-with-pops-f-8nbien', id: hoveredStateId },
            { hover: false }
            );
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState(
            { source: 'counties-with-pops-f-8nbien', sourceLayer: 'counties-with-pops-f-8nbien', id: hoveredStateId },
            { hover: true }
            );
            }
        // Change the cursor style as a UI indicator.

        // Single out the first found feature.
        var feature = e.features[0];
        console.log(feature)

        // Display a popup with the name of the county
        /*popup.setLngLat(e.lngLat)
			.setHTML('County: ' + feature.properties.NAME + '</br>' 
					+'Population: ' + feature.properties.POPESTIMATE2019 + "</br>")
            .addTo(map);*/
	});


});