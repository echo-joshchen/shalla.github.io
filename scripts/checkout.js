var db = null;

$(document).ready(function () {
    $("#dbfile").change(loadDatabase);
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
    
    writeTableHeaderRow(res[0].columns);
    
    res[0].values.forEach(function(rowData) {
        writeTableRow(rowData);
    });    
}

function writeTableHeaderRow(rowData)
{
    var table = document.getElementById("tertable");
    var tableBody = document.createElement('thead');
    var row = document.createElement('tr');
    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
    table.appendChild(tableBody);
}

function writeTableRow(rowData)
{
    var table = document.getElementById("tertable");
    var row = document.createElement('tr');
    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });
    table.appendChild(row);
}
