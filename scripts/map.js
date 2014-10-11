var SantaRosa = [38.438710, -122.716763,"Santa Rosa"];
var addresses = [];
var coords = [];
var curr_stop = null;
var map;
var mapRead = false;

$(document).ready(function(){
    // The event listener for the file upload
    $("#txtFileUpload").change(handleTerritory);
    $("#refresh").click(refreshMap);
    
	createMap();
	//geocodeAddress(0);
	
	// Make map div resizable
	$("#mapResize").resizable();
});

// Callback function for when a territory file is selected
function handleTerritory(event)
{
	uploadFile(event);
}

// Generate the map
function generateMap()
{
	refreshMap();
}
