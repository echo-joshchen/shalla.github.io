var SantaRosa = [38.438710, -122.716763,"Santa Rosa"];
var coords = [];
var map = null;
var db = null;
var dbAddresses=[];
var ternameIndex = 5;
var routeIndex = 6;

$(document).ready(function () {
    $("#dbfile").change(loadDatabase);
    $("#tertable").click(refreshMap);
	$("#mapResize").resizable();

    $("#save").hide();
    $("#saveButton").click(saveTerritory);
    $("#incrButton").click(true, shiftRoute);
    $("#decrButton").click(false, shiftRoute);
    $("#applyRoute").click(applyRoute);
    $("#fillButton").click(fillTerritoryNames);
    $("#coordRoute").click(routeByCoords);
    $("#newTerrButton").click(addNewTerritory);
});

function shiftRoute(eventData)
{
    var tableRows = document.getElementById("tertable").children;
    var index1 = parseInt(document.getElementById("index1").value);
    var index2 = parseInt(document.getElementById("index2").value);

    // For each address, increase the route by 1
    // Start at 1 to skip thead
    for (var i = index1; i <= index2 && i < tableRows.length; i++)
    {
        var route = tableRows[i].children[routeIndex].children[0].value;
        if (route == "")
        {
            route = 0;
        }
        else
        {
            route = parseInt(route);    
        }
        if (eventData.data == true)
        {
            route = route+1;
        }
        else
        {
            route = route-1;
        }
        tableRows[i].children[routeIndex].children[0].value = route;
    }
}

function fillTerritoryNames()
{
    var tableRows = document.getElementById("tertable").children;
    var tername = document.getElementById("ternameFill").value;
    var index1 = parseInt(document.getElementById("ternameindex1").value);
    var index2 = parseInt(document.getElementById("ternameindex2").value);

    // For each address, if the route is blank, set route to the latitude value
    for (var i = index1; i <= index2 && i < tableRows.length; i++)
    {
        tableRows[i].children[ternameIndex].children[0].value = tername;
    }
}

function routeByCoords()
{
    var tableRows = document.getElementById("tertable").children;

    // For each address, if the route is blank, set route to the latitude value
    for (var i = 1; i < tableRows.length; i++)
    {
        var route = Math.round((coords[i-1][0] + coords[i-1][1])*1e6);
        console.log("Setting route for " + dbAddresses[i][0] + " " + dbAddresses[i][1] + ": " + route);
        tableRows[i].children[routeIndex].children[0].value = route;
    }
}

function writeTableHeaderRow()
{
    var table = document.getElementById("tertable");
    var tableBody = document.createElement('thead');
    var row = document.createElement('tr');
    
    // Create columns  
    var cell = document.createElement('td');
    cell.className = "index-head";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "city";
    cell.innerHTML = "City";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "addr";
    cell.innerHTML = "Address";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "conf";
    cell.innerHTML = "Confirmed";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "notes";
    cell.innerHTML = "Notes"
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "tername";
    cell.innerHTML = "Territory Name";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "route";
    cell.innerHTML = "Route Info";
    row.appendChild(cell);
    
    tableBody.appendChild(row);
    table.appendChild(tableBody);
}

function writeTableRow(rowData, index)
{
    //console.log("Writing row: " + String(rowData));
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
    
    // City
    cell = document.createElement('td');
    cell.className = "city";
    cell.innerHTML = rowData[3];
    row.appendChild(cell);
    
    // Address
    cell = document.createElement('td');
    cell.className = "addr";
    cell.innerHTML = rowData[1] + " " + rowData[2];
    row.appendChild(cell);
    dbAddresses[index] = [rowData[1], rowData[2], rowData[3]];
    
    // Confirmed
    cell = document.createElement('td');
    cell.className = "conf";
    if ( rowData[14] == 1 || rowData[14] == "Yes")
    {
        cell.innerHTML = "Yes";
    }
    else if ( rowData[9] == 1)
    {
        cell.innerHTML = "Not CH";
    }
    row.appendChild(cell);
    
    // Notes
    cell = document.createElement('td');
    cell.className = "notes";
    if (rowData[7] != null)
    {
        cell.innerHTML = rowData[7];
    }
    row.appendChild(cell);
    
    // Tername
    cell = document.createElement('td');
    cell.className = "tername";
    if (rowData[16] == null)
    {
        rowData[16] = "";
    }
    cell.innerHTML = "<input type='text' id='tername' value=\"" + rowData[16] + "\">";
    row.appendChild(cell);
    
    // Route
    cell = document.createElement('td');
    cell.className = "route";
    if (rowData[17] == null)
    {
        rowData[17] = "";
    }
    cell.innerHTML = "<input type='text' id='route' value='" + rowData[17] + "'>";
    row.appendChild(cell);
    
    table.appendChild(row);
    
    // Fill coordinate info;
    if (rowData[12] != null &&
        rowData[13] != null)
    {
        coords[index-1] = [rowData[12],rowData[13]];
    }
    
    return index + 1;
}

function saveTerritory()
{
    // Save the territory info
    var menu = document.getElementById("termenu");
    var tername = menu.options[menu.selectedIndex].value;

    var tableRows = document.getElementById("tertable").children;
    // For each address, write the data out
    // Start at 1 to skip thead
    for (var i = 1; i < tableRows.length; i++)
    {
        var data = tableRows[i];

        var tername = data.children[ternameIndex].children[0].value;
        var route = data.children[routeIndex].children[0].value;

        command = "SELECT count(*) FROM master WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\" AND city=\"" + dbAddresses[i][2] + "\";";
        res = db.exec(command);
        try 
        {
            if (res[0].values[0] >= 1)
            {
                // Tername
                command = "UPDATE master SET tername = \"" + tername + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\" AND city=\"" + dbAddresses[i][2] + "\";";
                res = db.exec(command);
                //console.log(tername);

                // Confirmed
                command = "UPDATE master SET route = \"" + route + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\" AND city=\"" + dbAddresses[i][2] + "\";";
                res = db.exec(command);
                //console.log(route);
                console.log("Address updated: " + String(dbAddresses[i]));
            }
            else if (housenum != "" && street != "" && city != "")
            {
                console.log("Couldn't find address: " + String(dbAddresses[i]));
            }
        }
        catch (err)
        {
            console.log("Address error: " + housenum + " " + street + " " + city + " had error: " + err.message);
        }
    }

    // Read out selected territory
    var data = db.export();
    var blob = new Blob([data], {type: "application/x-sqlite3;charset=" + document.characterSet});
    saveAs(blob, "territory.db");
    console.log("File save done");
}

function applyRoute()
{
    var menu = document.getElementById("termenu");
    var tername = menu.options[menu.selectedIndex].value;

    var tableRows = document.getElementById("tertable").children;
    // For each address, commit to the database
    // Start at 1 to skip thead
    for (var i = 1; i < tableRows.length; i++)
    {
        var data = tableRows[i];

        var tername = data.children[ternameIndex].children[0].value;
        var route = data.children[routeIndex].children[0].value;

        command = "SELECT count(*) FROM master WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\" AND city=\"" + dbAddresses[i][2] + "\";";
        res = db.exec(command);
        try 
        {
            if (res[0].values[0] >= 1)
            {
                // Tername
                command = "UPDATE master SET tername = \"" + tername + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\" AND city=\"" + dbAddresses[i][2] + "\";";
                res = db.exec(command);
                //console.log(tername);

                // Confirmed
                command = "UPDATE master SET route = \"" + route + "\" WHERE housenum=\"" + dbAddresses[i][0] + "\" AND street=\"" + dbAddresses[i][1] + "\" AND city=\"" + dbAddresses[i][2] + "\";";
                res = db.exec(command);
                //console.log(route);
                console.log("Address updated: " + String(dbAddresses[i]));
            }
            else if (housenum != "" && street != "" && city != "")
            {
                console.log("Couldn't find address: " + String(dbAddresses[i]));
            }
        }
        catch (err)
        {
            console.log("Address error: " + housenum + " " + street + " " + city + " had error: " + err.message);
        }
    }

    createTerritoryTable();
}

function addNewTerritory()
{
    // Save the territory info
    var newTerritoryName = document.getElementById("newTerrName").value;

    command = "SELECT count(*) FROM territory WHERE tername=\"" + newTerritoryName + "\";";
    res = db.exec(command);
    try 
    {
        if (res[0].values[0] == 0)
        {
            // Tername
            command = "INSERT INTO territory(tername, free) VALUES(\"" + newTerritoryName + "\", \"TRUE\");";
            res = db.exec(command);

            console.log("Territory added: " + newTerritoryName);
        }
        else
        {
            console.log("Territory already exists: " + newTerritoryName);
        }
    }
    catch (err)
    {
        console.log("Territory name " + newTerritoryName + " had error: " + err.message);
    }

    // Read out selected territory
    var data = db.export();
    var blob = new Blob([data], {type: "application/x-sqlite3;charset=" + document.characterSet});
    saveAs(blob, "territory.db");
    console.log("File save done");
}