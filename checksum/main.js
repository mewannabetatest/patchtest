"use strict";


function main(div)
{

	var out = document.createElement("div");
	out.style.fontFamily = "monospace";
	out.innerHTML = "Load a file to see it's checksum...";
	var flb = document.createElement("input");
	flb.type = "file";
	div.appendChild(flb);
	div.appendChild(document.createElement("br"));
	div.appendChild(document.createElement("br"));
	div.appendChild(out);
	flb.addEventListener("change",function(e)
	{
		var file1 = e.target.files[0];
		if (!file1) {
			return;
		}
		var reader1 = new FileReader();
		reader1.onload = function(e)
		{
			var bsmc = new Uint8Array(e.target.result);
			var cs = checksum(bsmc);
			out.innerHTML = cs;
		};
		reader1.readAsArrayBuffer(file1);

	});

}
