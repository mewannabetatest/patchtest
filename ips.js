"use strict";

// Modifies ROM data using ips file data, according to ips spec
// Based on spec as defined in https://zerosoft.zophar.net/ips.php

function applyIps(bsmc, bips)
{
	// bsmc is a byte array populated by the ROM's smc file (a Uint8Array specifically)
	// bips is a byte array populated by ips file for the patch (also a Uint8Array)

	// Tracks if the ips file is fucked up anywhere
	var ipsvalid = false;

	// Parse ips chunks
	var i = 5;
	while(i+2<bips.length)
	{
		// Check if chunk is "EOF"
		if( bips[i+0]==69
		 && bips[i+1]==79
		 && bips[i+2]==70)
		{
			console.log("EOF triggered");
			ipsvalid = true;
			break;
		}

		// Get byte offset
		var os = (bips[i+0]<<16)+(bips[i+1]<<8)+bips[i+2];

		// Get chunk length
		if(i+4>=bips.length) break;
		var chlen = (bips[i+3]<<8)+bips[i+4];

		// Overwrite with chunk data
		if(chlen==0)
		{
			// "RLE"(?) chunk
			if(i+7>=bips.length) break;
			var rlen = (bips[i+5]<<8)+bips[i+6];
			var val = bips[i+7];
			if(os+rlen-1>=bsmc.length) break;
			for(var r=0;r<rlen;r++)
			{
				bsmc[os+r] = val;
			}
			i+= 8;
		}
		else
		{
			// Normal chunk
			if(i+5+chlen-1>=bips.length) break;
			if(os+chlen-1>=bsmc.length) break;
			for(var r=0;r<chlen;r++)
			{
				bsmc[os+r] = bips[i+5+r];
			}
			i+= 5+chlen;
		}

	}

	// Check that ips begins with "PATCH"
	if(bips[0]!='P'.charCodeAt(0)) ipsvalid = false;
	if(bips[1]!='A'.charCodeAt(0)) ipsvalid = false;
	if(bips[2]!='T'.charCodeAt(0)) ipsvalid = false;
	if(bips[3]!='C'.charCodeAt(0)) ipsvalid = false;
	if(bips[4]!='H'.charCodeAt(0)) ipsvalid = false;

	// Return bool indicating validity of IPS
	return ipsvalid;

}


