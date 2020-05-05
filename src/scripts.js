var countyData;
var stateData;
var currentDateSelected;
$(document).ready(function () {
	$.getJSON("https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/time-series-counties.json", function (json) {
		countyData = json;
	}).done(function() {
		console.log('counties downloaded')
		countyKeys = (Object.keys(countyData))
		currentDateSelected = countyKeys[countyKeys.length-1]
	});

	$.getJSON("https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/time-series-states.json", function (json) {
		stateData = json;
	});

});

mapboxgl.accessToken = 'pk.eyJ1IjoiZ3NlcHVsdmVkYTk2IiwiYSI6ImNrNzlmaGFvNDBzcHozZG9kOXQxNjF0bW8ifQ.P4nx2cJHuZTio2JivJyBDA';
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/light-v10',
	center: [-99.9, 41.5],
	zoom: 4
});

function validateDate() {
	var minDate = new Date('01/21/2020');
	var maxDate = new Date('05/03/2020');
	var dateToCheck = new Date($("#mapdate").val())

	if (dateToCheck > minDate && dateToCheck <= maxDate) {
		reloadMap()
	} else {
		alert('Date not available\n' + dateToCheck + '')
	}
}

function reloadMap() {
	dateValue = moment($("#mapdate").val());
	dateToLoad = dateValue.format("YYYY-MM-DD").toString()
	currentDateSelected = dateToLoad

	var newStateExpression = ['match', ['get', 'STATE']];
	var newCountyExpression = ['match', ['get', 'fips']];

	stateData[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])
		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
			newStateExpression.push(row['STATE'], color);
	});
	countyData[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])
		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
			newCountyExpression.push(row['fips'], color);
	});

	newStateExpression.push('rgba(255,255,255,1)');
	newCountyExpression.push('rgba(255,255,255,1)');

	map.setPaintProperty('covid-state', 'fill-color', newStateExpression)
	map.setPaintProperty('covid-county', 'fill-color', newCountyExpression)
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

	var countyExpression = ['match', ['get', 'fips']];
	var stateExpression = ['match', ['get', 'STATE']];

	countyData[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])

		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
		countyExpression.push(row['fips'], color);
	});

	stateData[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])

		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
		stateExpression.push(row['STATE'], color);
	});

	// Last value is the default, used where there is no countyData
	countyExpression.push('rgba(255,255,255,1)');
	stateExpression.push('rgba(255,255,255,1)');

	// Add layer from the vector tile source with countyData-driven style
	map.addLayer({
		'id': 'covid-county',
		'type': 'fill',
		'source': 'counties-with-pops-f-8nbien',
		'source-layer': 'counties-with-pops-f-8nbien',
		'paint': {
			'fill-color': countyExpression,
			'fill-outline-color': '#000000',
			'fill-opacity': 0.75,
		}
	});

	map.addLayer({
		'id': 'covid-state',
		'type': 'fill',
		'source': 'state-lines',
		'source-layer': 'state-lines',
		'paint': {
			'fill-color': stateExpression
		}
	})

	map.addLayer({
		'id': 'statelines',
		'type': 'line',
		'source': 'state-lines',
		'source-layer': 'state-lines',
		'paint': {
			'line-color': '#000000',
			'line-width': 2
		}
	});

	map.on('mousemove', 'covid-county', function (e) {
		map.getCanvas().style.cursor = 'pointer';
		var coordinates = e.features[0].geometry.coordinates.slice();
		var description = e.features[0].properties.description;
		// Single out the first found feature.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}
		var feature = e.features[0];
		selectedCounty = countyData[currentDateSelected].filter(county => county.fips === feature.properties.fips);

		document.getElementById("info-box").innerHTML = (feature.properties.NAME + ' County' + '</br>' +
			'Population: ' + feature.properties.POPESTIMATE2019 + '</br>' +
			'Cases: ' + selectedCounty[0]['confirmed'] + '</br>' +
			'Infection Rate: ' + selectedCounty[0]['infection_rate'].toFixed(2) + '/100,000 People</br>' +
			'Deaths: ' + selectedCounty[0]['confirmed'] + '</br>')
	});
	map.on('mouseleave', 'covid-county', function () {
		map.getCanvas().style.cursor = '';
		document.getElementById("info-box").innerHTML = "Hover over the map for more info"
	});

	map.on('mousemove', 'covid-state', function (e) {
		map.getCanvas().style.cursor = 'pointer';
		var coordinates = e.features[0].geometry.coordinates.slice();
		var description = e.features[0].properties.description;
		// Single out the first found feature.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}
		var feature = e.features[0];
		selectedState = stateData[currentDateSelected].filter(state => state.STATE === feature.properties.STATE);

		document.getElementById("info-box").innerHTML = (feature.properties.NAME+ '</br>' +
			'Population: ' + feature.properties.POPESTIMATE2019 + '</br>' +
			'Cases: ' + selectedState[0]['confirmed'] + '</br>' +
			'Infection Rate: ' + selectedState[0]['infection_rate'].toFixed(2) + '/100,000 People</br>' +
			'Deaths: ' + selectedState[0]['confirmed'] + '</br>')
	});
	map.on('mouseleave', 'covid-county', function () {
		map.getCanvas().style.cursor = '';
		document.getElementById("info-box").innerHTML = "Hover over the map for more info"
	});

	map.on('zoom', function () {
		//popup.remove();
	});

	var toggleableLayerIds = ['covid-state', 'covid-county'];

	// set up the corresponding toggle button for each layer
	for (var i = 0; i < toggleableLayerIds.length; i++) {
		var id = toggleableLayerIds[i];

		var link = document.createElement('a');
		link.href = '#';
		link.className = 'active';
		link.textContent = id;

		link.onclick = function (e) {
			var clickedLayer = this.textContent;
			e.preventDefault();
			e.stopPropagation();

			var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

			// toggle layer visibility by changing the layout object's visibility property
			if (visibility === 'visible') {
				map.setLayoutProperty(clickedLayer, 'visibility', 'none');
				this.className = '';
			} else {
				this.className = 'active';
				map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
			}
		};

		var layers = document.getElementById('menu');
		layers.appendChild(link);
	}


	//map.addControl(new mapboxgl.NavigationControl());
});