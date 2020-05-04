var data;
$.getJSON("https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/time-series.json", function (json) {
	data = json;
});

var currentDateSelected = '04-30-2020'

mapboxgl.accessToken = 'pk.eyJ1IjoiZ3NlcHVsdmVkYTk2IiwiYSI6ImNrNzlmaGFvNDBzcHozZG9kOXQxNjF0bW8ifQ.P4nx2cJHuZTio2JivJyBDA';
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/light-v10',
	center: [-99.9, 41.5],
	zoom: 4
});

var popup = new mapboxgl.Popup({
	closeButton: false
});

function validateDate() {
	var minDate = new Date('03/21/2020');
	var maxDate = new Date('05/01/2020');
	var dateToCheck = new Date($("#mapdate").val())

	if (dateToCheck > minDate && dateToCheck < maxDate) {
		reloadMap()
	} else {
		alert('Selected date out of range or duplicate!!' + dateToCheck + '')
	}
}

function reloadMap() {
	dateValue = moment($("#mapdate").val());
	dateToLoad = dateValue.format("MM-DD-YYYY").toString()
	currentDateSelected = dateToLoad
	map.removeLayer('states-join')

	var rExpression = ['match', ['get', 'fips']];
	//console.log(rExpression.length)

	data[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])
		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
		rExpression.push(row['fips'], color);
	});

	rExpression.push('rgba(255,255,255,1)');

	map.addLayer({
		'id': 'states-join',
		'type': 'fill',
		'source': 'counties-with-pops-f-8nbien',
		'source-layer': 'counties-with-pops-f-8nbien',
		'paint': {
			'fill-color': rExpression,
			'fill-outline-color': '#000000',
			'fill-opacity': 0.75,
		}
	});

	map.moveLayer('states-join', 'statelines')
}

map.on('load', function () {
	map.addSource('counties-with-pops-f-8nbien', {
		type: 'vector',
		url: 'mapbox://gsepulveda96.aj2hpi11'
	});

	map.addSource('state-lines', {
		type: 'vector',
		url: 'mapbox://gsepulveda96.statelines'
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

	map.addLayer({
		'id': 'statelines',
		'type': 'line',
		'source': 'state-lines',
		'source-layer': 'state-lines'
	});

	map.on('mousemove', 'states-join', function (e) {
		map.getCanvas().style.cursor = 'pointer';
		var coordinates = e.features[0].geometry.coordinates.slice();
		var description = e.features[0].properties.description;
		// Single out the first found feature.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
			}
		var feature = e.features[0];
		selectedCounty = data[currentDateSelected].filter(county => county.fips === feature.properties.fips);

		// Display a popup with the name of the county and info
		popup.setLngLat(e.lngLat)
			.setHTML(feature.properties.NAME + ' County' + '</br>' 
					+'Population: ' + feature.properties.POPESTIMATE2019 + '</br>'
					+'Cases: ' + selectedCounty[0]['confirmed'] + '</br>'
					+'Infection Rate: ' + selectedCounty[0]['infection_rate'].toFixed(2) + '/100,000 People</br>'
					+'Recovered: ' + selectedCounty[0]['recovered'] + '</br>'
					+'Active: ' + selectedCounty[0]['active'] + '</br>'
					+'Deaths: ' + selectedCounty[0]['confirmed'] + '</br>')
            .addTo(map);
	});
	map.on('mouseleave', 'places', function() {
		map.getCanvas().style.cursor = '';
		popup.remove();
	});

	map.on('zoom', function() {
		popup.remove();
	});

	map.addControl(new mapboxgl.NavigationControl());
});