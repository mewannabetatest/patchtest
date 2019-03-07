"use strict";


function main(div)
{

	div.style.fontFamily = "monospace";

	// Top Text
	div.appendChild(document.createTextNode("Upload a headered or unheadered FF3 .smc to get started"));
	div.appendChild(document.createElement("br"));
	div.appendChild(document.createElement("br"));
	div.appendChild(document.createTextNode("NOTE: ONLY WORKS WITH 1.0 UNHEADERED ATM- if you're seeing this, you probably saw me posting about this on discord:"));
	div.appendChild(document.createElement("br"));
	div.appendChild(document.createTextNode("if you could run the sum checker (TODO LINK) and PM me the result, I'll be able to get this to work for your rom, thanks!"));

	// File loader & status text
	var loadBut = document.createElement("input");
	loadBut.type = "file";
	loadBut.accept = ".smc";
	var textDiv = document.createElement("div");
	textDiv.style.height = "20px";
	textDiv.innerHTML = "";
	div.appendChild(document.createElement("br"));
	div.appendChild(document.createElement("br"));
	div.appendChild(loadBut);
	div.appendChild(textDiv);
	loadBut.addEventListener("change", function(e)
	{
		var file = e.target.files[0];
		if (!file) {
			return;
		}
		var reader = new FileReader();
		reader.onload = function(e)
		{
			// Compute checksum & version
			var bsmc = new Uint8Array(e.target.result);
			var cs = checksum(bsmc);
			var hr = cs=="4cdfc79b44cd6d532dc6631a5c762094"
			      || cs=="GET ME!!";
			var ur = cs=="GET ME"
		          || cs=="GET ME!!";

			// Display autodetect result (and stop if rom invalid)
			if(hr)      textDiv.innerHTML = "FF3 (headered) Detected";
			else if(ur) textDiv.innerHTML = "FF3 (unheadered) Detected";
			else
			{
				textDiv.innerHTML = "Invalid ROM.  Make sure you're uploading an unpatched rom of Final Fantasy 3 (the US edition; 1.0 or 1.1 will both work)";
				applyBut.disabled = true;
				downloadDiv.innerHTML = "";
				return;
			}

			// Activate Apply button, with appropriate data
			activateApplyBut(bsmc, hr);

		};
		reader.readAsArrayBuffer(file);

	});

	// Apply Button
	function activateApplyBut(bsmc, headered)
	{
		applyBut.onclick = function()
		{
			var filename = headered?"patches/bnwh190.ips":"patches/bnwu190.ips";

			var xhr = new XMLHttpRequest();
			xhr.open("GET", filename,true);
			xhr.responseType = "arraybuffer";
			xhr.onload = function(e)
			{
				var ab = xhr.response;
				if(ab)
				{
					var bips = new Uint8Array(ab);
					console.log(bips)
					if(applyIps(bsmc, bips)) genDownloadBut(bsmc);
					else alert("FUUUUCK some shit got fucked up"); //TODO
				}
				else console.log("FUUUUUUUUUCK"); // TODO
			};
			xhr.send(null);
			applyBut.disabled = true;
			textDiv.innerHTML = "Downloading and Applying patch...";
		}
		applyBut.disabled = false;
	}
	var applyBut = document.createElement("button");
	applyBut.innerHTML = "Apply Patch";
	applyBut.disabled = true;
	div.appendChild(document.createElement("br"));
	div.appendChild(applyBut);

	// Download Button
	var downloadDiv = document.createElement("div");
	downloadDiv.style.height = "50px";
	div.appendChild(document.createElement("br"));
	div.appendChild(document.createElement("br"));
	div.appendChild(downloadDiv)
	function genDownloadBut(bsmc)
	{
		var downloadAnc = document.createElement("a");
		downloadAnc.style.width = "70px";
		downloadAnc.style.backgroundColor = "#dfd";
		downloadAnc.style.fontColor = "#000";
		downloadAnc.innerHTML = "Patch complete! Click here to download";
		downloadDiv.appendChild(downloadAnc);
		downloadDiv.addEventListener("mousedown", function() // TODO is mousedown ghetto here??
		{
			var blob = new Blob([bsmc], { type: "mimeString"});

			// TODO add checksums on final ROMs, to make sure they really patched properly

			var url = URL.createObjectURL(blob);
			downloadAnc.download = "BNW190.smc";
			downloadAnc.href = url;
		});
	}


}
