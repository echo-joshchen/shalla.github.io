var SantaRosa = [38.438710, -122.716763,"Santa Rosa"];
var coords = [];
var map = null;
var db = null;
var dbAddresses=[];
var addresses=[];
var numTotalAddresses=0;
var numAddressesCoded=0;
var maxTableSize=50;

// Max at the same time
var maxGeocode=10;

$(document).ready(function () {
    $("#dbfile").change(loadDatabase);
    $("#tertable").click(refreshMap);
	$("#mapResize").resizable();

    $("#save").hide();
    $("#saveButton").click(saveTerritory);

    $("#geocodeAllButton").click(geocodeAll);
});

function geocodeAll()
{
    // Mark selected territory as checked out
    var menu = document.getElementById("termenu");

    var tableRows = document.getElementById("tertable").children;
    // Start geocoding each address
    // Start at 1 to skip thead
    numAddressesCoded = 0;
    numTotalAddresses = 0;
    for (var i = 1; i < tableRows.length; i++)
    {
        if (numTotalAddresses >= maxGeocode)
        {
            break;
        }
        var data = tableRows[i];

        var housenum = data.children[2].children[0].value;
        var street = data.children[3].children[0].value;
        var city = data.children[4].children[0].value;
        var lat = data.children[7].children[0].value;
        var lng = data.children[8].children[0].value;

        if (lat == null ||
            lat == "" ||
            lng == null ||
            lng == "")
        {
            numTotalAddresses++;
            geocode_address(housenum, street, city, i);
        }
    }
}

function geocode_address(housenum, street, city, index) 
{
    // Construct address (assume CA)
    var address = housenum + " " + street + " " + city + " " + ", CA";
    console.log("Start coding " + address);
    // Geocode all addresses
    GMaps.geocode({
        address: address,
        callback: function(results, status) {
            if (status == 'OK') {
                var latlng = results[0].geometry.location;
                // Store in array
                coords[index-1] = [latlng.lat(), latlng.lng()];

                // Write to table
                var tableRows = document.getElementById("tertable").children;
                var data = tableRows[index];
                data.children[7].children[0].value = latlng.lat();
                data.children[8].children[0].value = latlng.lng();

                console.log("Address coded: " + address + " - " + latlng.lat() + ", " + latlng.lng());
                console.log("Results : " + String(results[0]));

                numAddressesCoded++;
                checkIfCodingDone();
            }
            else {
                console.log("Geocode status: " + String(status));
            }
        }
    });
}

function checkIfCodingDone()
{
    if (numAddressesCoded >= numTotalAddresses)
    {
        refreshMap();
    }
}

// Load database from a user selected file
function loadDatabase()
{
    var f =  $('#dbfile').prop('files')[0];
    var r = new FileReader();
    r.onload = function(){readDbFile(r)};
    r.readAsArrayBuffer(f);
    
    //$("#fileSelect").hide();
    $("#save").show();
}

// Read the database file
function readDbFile(fileReader)
{
    var Uints = new Uint8Array(fileReader.result);
    db = new SQL.Database(Uints);
        
    // Clear existing menu
    document.getElementById("termenu").innerHTML = "";
    
    // Read out territory names
    var res = db.exec("SELECT tername FROM territory");
    res[0].values.forEach(function(rowData) {
        fillDropDownMenu(rowData);
    });
    $(".chosen-select").chosen();
    
    $("#termenu").change(createTerritoryTable);
}

function fillDropDownMenu(rowData)
{
    var menu = document.getElementById("termenu");
    var terOption = document.createElement('option');
    terOption.value = rowData[0];
    terOption.innerHTML = rowData[0];
    menu.appendChild(terOption);
}

function createTerritoryTable()
{
    // Clear current table and map
    document.getElementById("tertable").innerHTML = "";
    coords = [];
    dbAddresses = [];
    
    // Read out selected territory
    var menu = document.getElementById("termenu");
    var tername = menu.options[menu.selectedIndex].value;
    var res = db.exec("SELECT * FROM master WHERE tername = \"" + tername + "\";");
    
    writeTableHeaderRow();
    
    var index = 1;
    res[0].values.forEach(function(rowData) {
        if (index < maxTableSize)
        {
            index = writeTableRow(rowData, index);
        }
    });    

    generateMap();
}

function writeTableHeaderRow()
{
    var table = document.getElementById("tertable");
    var tableBody = document.createElement('thead');
    var row = document.createElement('tr');
    
    var cell = document.createElement('td');
    cell.className = "index-head";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "name";
    cell.innerHTML = "Name";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "housenum";
    cell.innerHTML = "House Number";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "street";
    cell.innerHTML = "Street";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "city";
    cell.innerHTML = "City";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.innerHTML = "Confirmed";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "notes";
    cell.innerHTML = "Notes";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "lat";
    cell.innerHTML = "Lat";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "long";
    cell.innerHTML = "Long";
    row.appendChild(cell);
    
    tableBody.appendChild(row);
    table.appendChild(tableBody);
}

function writeTableRow(rowData, index)
{
    var verify = $("#verifySel").val() == "show"
    // Skip if marked as not chinese
    if (!verify && (rowData[9] == 1 || rowData[14] == "Not CH"))
    {
        return index;
    }
    
    var table = document.getElementById("tertable");
    var row = document.createElement('tr');
    
    // Fill cell data
    
    // Index
    var cell = document.createElement('td');
    cell.className = "index";
    cell.innerHTML = index;
    row.appendChild(cell);
    
    // Name
    cell = document.createElement('td');
    cell.className = "name";
    if (rowData[0] == null)
    {
        rowData[0] = "";
    }
    cell.innerHTML = "<input type='text' id='name' value='" + rowData[0] + "'>";
    row.appendChild(cell);
    
    // House Number
    cell = document.createElement('td');
    cell.className = "housenum";
    cell.innerHTML = "<input type='text' id='housenum' value='" + rowData[1] + "'>";
    row.appendChild(cell);
    
    // Street
    cell = document.createElement('td');
    cell.className = "street";
    cell.innerHTML = "<input type='text' id='street' value='" + rowData[2] + "'>";
    row.appendChild(cell);
    dbAddresses[index] = [rowData[1], rowData[2]];
    
    // City
    cell = document.createElement('td');
    cell.className = "city";
    cell.innerHTML = "<input type='text' id='city' value='" + rowData[3] + "'>";
    row.appendChild(cell);
    
    // Confirmed
    cell = document.createElement('td');
    cell.className = "conf";
    cell.innerHTML = "<select id='confSelect'><option value='Yes'>Yes</option><option value='No'>No</option></select>";
    row.appendChild(cell);
    if ( rowData[14] == 1 || rowData[14] == "Yes")
    {
        cell.querySelector("#confSelect").value="Yes";
    }
    else
    {
        cell.querySelector("#confSelect").value="No";
    }
    
    // Notes
    cell = document.createElement('td');
    cell.className = "notes";
    if (rowData[7] == null)
    {
        rowData[7] = "";
    }
    cell.innerHTML = "<input type='text' id='notes' value='" + rowData[7] + "'>";
    row.appendChild(cell);
    
    // Fill coordinate info;
    if (rowData[12] != null &&
        rowData[13] != null)
    {
        coords[index-1] = [rowData[12],rowData[13]];
    }
    
    // Lat
    cell = document.createElement('td');
    cell.className = "lat";
    if (rowData[12] == null)
    {
        rowData[12] = "";
    }
    cell.innerHTML = "<input type='text' id='lat' value='" + rowData[12] + "'>";
    row.appendChild(cell);
    
    // Long
    cell = document.createElement('td');
    cell.className = "long";
    if (rowData[13] == null)
    {
        rowData[13] = "";
    }
    cell.innerHTML = "<input type='text' id='long' value='" + rowData[13] + "'>";
    row.appendChild(cell);
    
    table.appendChild(row);
    
    return index + 1;
}

function generateMap()
{
    if (map == null)
    {
        createMap();
    }
    refreshMap();
}

function saveTerritory()
{
    // Mark selected territory as checked out
    var menu = document.getElementById("termenu");
    var tername = menu.options[menu.selectedIndex].value;
    var command = "UPDATE territory SET free=\"TRUE\" WHERE tername=\"" + tername + "\";";
    var res = db.exec(command);

    // Mark check out date from text box
    var date = $("#inDate").val();
    command = "UPDATE territory SET indate = \"" + date + "\" WHERE tername=\"" + tername + "\";";
    res = db.exec(command);

    var tableRows = document.getElementById("tertable").children;
    // For each address, write the data out
    // Start at 1 to skip thead
    for (var i = 1; i < tableRows.length; i++)
    {
        var data = tableRows[i];

        var name = data.children[1].children[0].value;
        var housenum = data.children[2].children[0].value;
        var street = data.children[3].children[0].value;
        var city = data.children[4].children[0].value;
        var confirmed = data.children[5].children[0].value;
        var notes = data.children[6].children[0].value;
        var lat = data.children[7].children[0].value;
        var longitude = data.children[8].children[0].value;


        command = "SELECT count(*) FROM master WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\";";
        res = db.exec(command);
        if (res[0].values[0] >= 1)
        {
            // Name
            command = "UPDATE master SET name = \"" + name + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\";";
            res = db.exec(command);
            //console.log(name);

            // House number
            command = "UPDATE master SET housenum = \"" + housenum + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\";";
            res = db.exec(command);
            //console.log(housenum);

            // House number
            command = "UPDATE master SET street = \"" + street + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\";";
            res = db.exec(command);
            //console.log(street);

            // Confirmed
            command = "UPDATE master SET confirmed = \"" + confirmed + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\";";
            res = db.exec(command);
            //console.log(confirmed);
            
            // Notes
            command = "UPDATE master SET notes = \"" + notes + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\";";
            res = db.exec(command);
            //console.log(notes);
            
            // Lat
            command = "UPDATE master SET lat = \"" + lat + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\";";
            res = db.exec(command);
            //console.log(lat);
            
            // Long
            command = "UPDATE master SET long = \"" + longitude + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\";";
            res = db.exec(command);
            //console.log(longitude);
        }
        else
        {
            console.log("Don't add addresses in the geocoding section duh")
        }
    }

    // Read out selected territory
    var data = db.export();
    var blob = new Blob([data], {type: "application/x-sqlite3;charset=" + document.characterSet});
    saveAs(blob, "territory.db");
    console.log("File save done");
}