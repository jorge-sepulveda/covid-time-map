var data;
$.getJSON("https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/time-series.json", function (json) {
	data = json;
});

currentDateSelected = '04-28-2020'

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

function validateDate() {
	var minDate = new Date('03/21/2020');
	var maxDate = new Date('04/30/2020');
	var dateToCheck = new Date($("#mapdate").val())

	if (dateToCheck > minDate && dateToCheck <= maxDate) {
		reloadMap()
	} else {
		alert('Selected date out of range or duplicate!!' + dateToCheck + '')
	}
}

function reloadMap() {
	console.log("reload map called");
	dateValue = moment($("#mapdate").val());
	dateToLoad = dateValue.format("MM-DD-YYYY").toString()
	console.log(dateToLoad)
	currentDateSelected = dateToLoad
	map.removeLayer('states-join')

	currentSource = map.getSource('counties-with-pops-f-8nbien')
	console.log(currentSource)

	var newExpression = ['match', ['get', 'fips']];
	console.log(newExpression.length)

	data[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])
		//var green = (row['infection_rate'] / 9967 ) * 255;
		//var color = 'rgba(' + 0 + ', ' + green + ', ' + 0 + ', 1)';

		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";

		newExpression.push(row['fips'], color);
	});

	newExpression.push('rgba(255,255,255,1)');

	map.addLayer({
		'id': 'states-join',
		'type': 'fill',
		'source': 'counties-with-pops-f-8nbien',
		'source-layer': 'counties-with-pops-f-8nbien',
		'paint': {
			'fill-color': newExpression,
			'fill-outline-color': '#000000',
			'fill-opacity': 0.75,
		}
	});
}

map.on('load', function () {
	map.addSource('counties-with-pops-f-8nbien', {
		type: 'vector',
		url: 'mapbox://gsepulveda96.aj2hpi11'
	});

	var expression = ['match', ['get', 'fips']];
	console.log(expression.length)

	data[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])

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
			'fill-outline-color': '#000000',
			'fill-opacity': 0.75,
		}
	});

	map.on('mousemove', 'states-join', function (e) {

		/*if (e.features.length > 0) {
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
		    }*/
		// Change the cursor style as a UI indicator.

		// Single out the first found feature.
		var feature = e.features[0];
		//console.log(feature)

		// Display a popup with the name of the county
		/*popup.setLngLat(e.lngLat)
			.setHTML('County: ' + feature.properties.NAME + '</br>' 
					+'Population: ' + feature.properties.POPESTIMATE2019 + "</br>")
            .addTo(map);*/
	});


});