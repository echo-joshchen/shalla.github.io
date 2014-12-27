/**

This file has Google Maps API functions.

**/

// Geocode all addresses in addresses[]
function geocodeAddress(index) 
{
	// Geocode all addresses
	if (index < addresses.length)
	{
		GMaps.geocode({
			address: addresses[index],
			callback: function(results, status) {
			    if (status == 'OK') {
					var latlng = results[0].geometry.location;
					coords[index] = [latlng.lat(), latlng.lng(), addresses[index]];
					geocodeAddress(index + 1);
					console.log("Results : " + String(results[0]));
				}
				else {
					console.log("Geocode status: " + String(status));
				}
			}
		});
	}
	else
	{
	  refreshMap();
	}
}

// Creates the initial map at Santa Rosa
function createMap()
{
	map = new GMaps({
		el: '#map',
		lat: SantaRosa[0],
		lng: SantaRosa[1],
		zoom: 9
	});
	
	return map;
}

// Add the markers to the map
function setAddressMarkers()
{
	// Add all markers
	for (var i = 0; i < coords.length; i++) 
	{
		var markerName = "images/marker" + (i + 1) + ".png";
		if (coords[i] != null)
		{
			map.addMarker({
			  lat: coords[i][0],
			  lng: coords[i][1],
			  icon: markerName
			});
		}
	}
}

// Set the map location and zoom to fit all coords[]
function fitMap()
{
	var places = [];
	for (var i = 0; i < coords.length; i++)
	{
		if (coords[i] != null)
		{
			places.push(new google.maps.LatLng(coords[i][0], coords[i][1]));
		}
	}
	var bounds = new google.maps.LatLngBounds ();
	for (var i = 0; i < places.length; i++)
	{
		// Increase the bounds to take this point
		bounds.extend(places[i]);
	}
	//  Fit these bounds to the map
	map.fitBounds (bounds);
	
	delete bounds;
	for (var i = 0; i < places.length; i++)
	{
		delete places[i];
	}
	delete places;
}

// Resize map and set markers
function refreshMap()
{
    if (map != null)
    {
        fitMap();
        map.removeMarkers();
        setAddressMarkers();
    }
}