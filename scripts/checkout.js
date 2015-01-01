var SantaRosa = [38.438710, -122.716763,"Santa Rosa"];
var coords = [];
var map = null;
var db = null;
var verify = false;
var maxTableSize=50;

$(document).ready(function () {
    $("#dbfile").change(loadDatabase);
    $("#tertable").click(refreshMap);
	$("#mapResize").resizable();

    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    $("#outDate").val(month + "/" + day + "/" + year);

    $("#checkout").hide();
    $("#checkoutButton").click(checkoutTerritory);
});

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
    var verify = $("#verifySel").val() == "show"
    // Skip if marked as not chinese
    if (!verify && (rowData[9] == 1 || rowData[14] == "Not CH"))
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
    
    table.appendChild(row);
    
    // Fill coordinate info;
    if (rowData[12] != null &&
        rowData[13] != null)
    {
        coords[index-1] = [rowData[12],rowData[13]];
    }
    
    return index + 1;
}

function checkoutTerritory()
{
    // Mark selected territory as checked out
    var menu = document.getElementById("termenu");
    var tername = menu.options[menu.selectedIndex].value;
    var command = "UPDATE territory SET free=\"FALSE\" WHERE tername=\"" + tername + "\";";
    var res = db.exec(command);

    // Mark check out date from text box
    var date = $("#outDate").val();
    command = "UPDATE territory SET outdate = \"" + date + "\" WHERE tername=\"" + tername + "\";";
    var res = db.exec(command);

    // Read out selected territory
    var data = db.export();
    var blob = new Blob([data], {type: "application/x-sqlite3;charset=" + document.characterSet});
    saveAs(blob, "territory.db");
    console.log("File save done");
}