var data = null;

// Method that checks that the browser supports the HTML5 File API
function browserSupportFileUpload()
{
    var isCompatible = false;
    if (window.File && 
        window.FileReader && 
        window.FileList && 
        window.Blob) 
    {
		isCompatible = true;
    }
    return isCompatible;
}

// Method that reads and processes the selected file
function uploadFile(evt)
{
	if (!browserSupportFileUpload()) 
	{
		alert('The File APIs are not fully supported in this browser!');
    } 
    else 
    {
        var file = evt.target.files[0];
        var reader = new FileReader();
        reader.onload = processCsvData;
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
        reader.readAsText(file);
	}
}

// Process csv data
function processCsvData(event)
{
    var csvData = event.target.result;
    data = $.csv.toArrays(csvData);
    if (data && data.length > 0) 
    {
        processGeocodedData();
        generateMap();
    } 
    else 
    {
        alert('No data to import!');
    }
}

// Process territory data
function processAddressData()
{
    for (var i = 1; i < 5; i++)
    {
        var address = data[i][4] + " " + data[i][5] + " " + 
            data[i][6] + ", " + data[i][7] + ", " + data[i][8];
        addresses[i - 1] = address;
    }
}

// Process territory data that already has coordinates
function processGeocodedData()
{
    for (var i = 1; i < data.length; i++)
    {
        coords[i-1] = [data[i][21], data[i][22]];
    }
}

