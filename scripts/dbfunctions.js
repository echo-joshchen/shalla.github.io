var maxTableSize=50;

// Load database from a user selected file
function loadDatabase()
{
    var f =  $('#dbfile').prop('files')[0];
    var r = new FileReader();
    r.onload = function(){readDbFile(r)};
    r.readAsArrayBuffer(f);
    
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
    var res = db.exec("SELECT * FROM master WHERE tername = \"" + tername + "\" ORDER BY route;");
    
    writeTableHeaderRow();
    
    if (res[0].values)
    {
        var index = 1;
        for (var i = 0; i < res[0].values.length && index < maxTableSize; i++)
        {
            var rowData = res[0].values[i];
            index = writeTableRow(rowData, index);
        }
    }

    generateMap();
}

function generateMap()
{
    if (map == null)
    {
        createMap();
    }
    refreshMap();
}