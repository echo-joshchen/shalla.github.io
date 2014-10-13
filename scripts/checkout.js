var SantaRosa = [38.438710, -122.716763,"Santa Rosa"];
var coords = [];
var map = null;
var db = null;

$(document).ready(function () {
    $("#dbfile").change(loadDatabase);
    $("#refresh").click(refreshMap);
	$("#mapResize").resizable();
});

// Load database from a user selected file
function loadDatabase()
{
    var f =  $('#dbfile').prop('files')[0];
    var r = new FileReader();
    r.onload = function(){readDbFile(r)};
    r.readAsArrayBuffer(f);
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
    // Clear current table
    document.getElementById("tertable").innerHTML = "";
    
    // Read out selected territory
    var menu = document.getElementById("termenu");
    var tername = menu.options[menu.selectedIndex].value;
    var res = db.exec("SELECT * FROM master WHERE tername = \"" + tername + "\";");
    
    writeTableHeaderRow();
    
    var index = 1;
    res[0].values.forEach(function(rowData) {
        index = writeTableRow(rowData, index);
    });    
    
    generateMap();
}

function writeTableHeaderRow()
{
    var table = document.getElementById("tertable");
    var tableBody = document.createElement('thead');
    var row = document.createElement('tr');
    
    // Create columns
    var cell = document.createElement('td');
    cell.colSpan = "3";
    cell.className = "nh-head";
    cell.innerHTML = "NH";
    row.appendChild(cell);
    
    var cell = document.createElement('td');
    cell.className = "index-head";
    row.appendChild(cell);
    
    cell = document.createElement('td');
    cell.className = "name";
    cell.innerHTML = "Name";
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
    cell.innerHTML = "Notes";
    row.appendChild(cell);
    
    tableBody.appendChild(row);
    table.appendChild(tableBody);
}

function writeTableRow(rowData, index)
{
    // Skip if marked as not chinese
    if (rowData[9] == 1)
    {
        return index;
    }
    
    var table = document.getElementById("tertable");
    var row = document.createElement('tr');
    
    // Fill cell data
    // NH boxes
    row.appendChild(document.createElement('td'));
    row.appendChild(document.createElement('td'));
    row.appendChild(document.createElement('td'));
    
    // Index
    var cell = document.createElement('td');
    cell.className = "index";
    cell.innerHTML = index;
    row.appendChild(cell);
    
    // Name
    cell = document.createElement('td');
    cell.className = "name";
    cell.innerHTML = rowData[0];
    row.appendChild(cell);
    
    // Address
    cell = document.createElement('td');
    cell.className = "addr";
    cell.innerHTML = rowData[1] + " " + rowData[2];
    row.appendChild(cell);
    
    // Confirmed
    cell = document.createElement('td');
    cell.className = "conf";
    if ( rowData[14] == 1)
    {
        cell.innerHTML = "Yes";
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
    
    
    table.appendChild(row);
    
    // Fill coordinate info;
    if (rowData[12] != null &&
        rowData[13] != null)
    {
        coords[index-1] = [rowData[12],rowData[13]];
    }
    
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
