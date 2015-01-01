var SantaRosa = [38.438710, -122.716763,"Santa Rosa"];
var coords = [];
var map = null;
var db = null;
var dbAddresses=[];
var maxTableSize=50;
var table;

$(document).ready(function () {
    $("#dbfile").change(loadDatabaseStats);
    table = document.getElementById("statTable");
});

// Load database from a user selected file
function loadDatabaseStats()
{
    var f =  $('#dbfile').prop('files')[0];
    var r = new FileReader();
    r.onload = function(){readDbFileSearch(r)};
    r.readAsArrayBuffer(f);
}

// Read the database file
function readDbFileSearch(fileReader)
{
    var Uints = new Uint8Array(fileReader.result);
    db = new SQL.Database(Uints);

    generateStats()
}

function generateStats()
{
    // Clear current table
    table.innerHTML = "";
    try
    {
        writeAddressStats("Number of confirmed addresses", "Yes");
        writeAddressStats("Number of unconfirmed addresses", "No");
        writeAddressStats("Number of confirmed not chinese addresses", "Not CH");
        writeTerritoryStats("Number of territories");
        writeDbTerritoryStats("Number of db territories");
    }
    catch (err)
    {
        console.log("Error: " + err.message);
    }
}

function writeAddressStats(title, confirmed)
{
    var row = document.createElement('tr');

    var cell = document.createElement('td');
    cell.innerHTML = title;
    cell.className = "title";
    row.appendChild(cell);

    var command = "SELECT count(*) FROM master WHERE confirmed LIKE \"" + confirmed + "\" collate nocase;";
    var res = db.exec(command);
    cell = document.createElement('td');
    cell.className = "data";
    if (res[0] && res[0].values)
    {
        cell.innerHTML = res[0].values[0][0];
        console.log("# Confirmed: " + res[0].values[0][0]);
    }

    command = "SELECT count(*) FROM master;";
    res = db.exec(command);
    if (res[0] && res[0].values)
    {
        cell.innerHTML +=  "/" + res[0].values[0][0];
        console.log(title + ": " + res[0].values[0][0]);
    }
    row.appendChild(cell);

    table.appendChild(row);
}

function writeTerritoryStats(title)
{
    var row = document.createElement('tr');

    var cell = document.createElement('td');
    cell.innerHTML = title;
    cell.className = "title";
    row.appendChild(cell);

    var command = "SELECT count(*) FROM territory;";
    var res = db.exec(command);
    cell = document.createElement('td');
    cell.className = "data";
    if (res[0] && res[0].values)
    {
        cell.innerHTML = res[0].values[0][0];
        console.log("# Territories: " + res[0].values[0][0]);
    }
    row.appendChild(cell);

    table.appendChild(row);
}

function writeDbTerritoryStats(title)
{
    var row = document.createElement('tr');

    var cell = document.createElement('td');
    cell.innerHTML = title;
    cell.className = "title";
    row.appendChild(cell);

    var command = "SELECT count(DISTINCT tername) FROM master;";
    var res = db.exec(command);
    cell = document.createElement('td');
    cell.className = "data";
    if (res[0] && res[0].values)
    {
        cell.innerHTML = res[0].values[0][0];
        console.log("# DB Territories: " + res[0].values[0][0]);
    }
    row.appendChild(cell);

    table.appendChild(row);
}