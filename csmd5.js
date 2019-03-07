"use strict";

// Generates a md5 hash from file data, to check it's integrity
// Built from pseudocode of MD5 on wikipedia: https://en.wikipedia.org/wiki/MD5#Pseudocode
// Spec: https://www.ietf.org/rfc/rfc1321.txt

function checksum(bin)
{
	// bin is the byte array to be checked (a Uint8Array specifically)

	function leftrotate(x,c)
	{
		x = x>>>0;
		c = c>>>0;
		return (x<<c)|(x>>>(32-c));
	}

	// Them variables
	var s = new Uint32Array(64);
	var K = new Uint32Array(64);
	var i;

	// Padded copy of bin
	var bcopy;
	(function()
	{
		var blen = bin.length;
		var pbc = 64-((blen+8)%64) + 8; // padding byte count
		var clen = blen+pbc;
		bcopy = new Uint8Array(clen);
		for(i=0;i<blen;i++) bcopy[i] = bin[i];
		bcopy[blen] = 0x80; // Add a 1 bit followed by 7 0s
		for(i=blen+1;i<clen-2;i++) bcopy[i] = 0x00; // Fill rest of padding with 0s
		bcopy[clen-1] = (8*blen/0x100000000)>>24;
		bcopy[clen-2] = (8*blen/0x100000000)>>16;
		bcopy[clen-3] = (8*blen/0x100000000)>>8;
		bcopy[clen-4] = (8*blen/0x100000000)>>0;
		bcopy[clen-5] = (8*blen)>>24;
		bcopy[clen-6] = (8*blen)>>16;
		bcopy[clen-7] = (8*blen)>>8;
		bcopy[clen-8] = (8*blen)>>0;
	})();

	// Hardcode s and K values (fucking javascript makes this a pain in the ass)
	(function()
	{
		var sh = [7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
		          5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
		          4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
		          6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21 ];
		for(i=0;i<64;i++) s[i] = sh[i];

       	var Kh = [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
	              0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
	              0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
	              0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
	              0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
	              0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
	              0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
	              0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
	              0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
	              0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
	              0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
	              0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
	              0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
	              0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
	              0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
	              0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391 ];
		for(i=0;i<64;i++) K[i] = Kh[i];

	})();

	// Initialize variables
	var a0 = 0x67452301;
	var b0 = 0xefcdab89;
	var c0 = 0x98badcfe;
	var d0 = 0x10325476;

	// Process byte array in chunks
	var M = new Uint32Array(16);
	for(var c=0;c<bcopy.length;c+=64)
	{
		for(var i=0;i<16;i++)
		{
			M[i] = (bcopy[c+4*i+3]<<24)|(bcopy[c+4*i+2]<<16)|(bcopy[c+4*i+1]<<8)|(bcopy[c+4*i]>>>0);
		}

		var A = a0;
		var B = b0;
		var C = c0;
		var D = d0;

		for(var i=0;i<64;i++)
		{
			var F;
			var g;

			if(i<16)
			{
				F = (B&C)|((~B)&D);
				g = i;
			}
			else if(i<32)
			{
				F = (D&B)|((~D)&C);
				g = (5*i+1)%16;
			}
			else if(i<48)
			{
				F = B^C^D;
				g = (3*i+5)%16;
			}
			else if(i<64)
			{
				F = C^(B|(~D));
				g = (7*i)%16;
			}

			F = (0xffffffff) & (F+A+K[i]+M[g]);
			A = (0xffffffff) & D;
			D = (0xffffffff) & C;
			C = (0xffffffff) & B;
			B = (0xffffffff) & (B+leftrotate(F, s[i]));

		}

		a0 = (0xffffffff) & (a0+A);
		b0 = (0xffffffff) & (b0+B);
		c0 = (0xffffffff) & (c0+C);
		d0 = (0xffffffff) & (d0+D);

	}

	// Generate string of hash, and return
	var r = "";
	r+= (d0>>>0).toString(16);
	r+= (c0>>>0).toString(16);
	r+= (b0>>>0).toString(16);
	r+= (a0>>>0).toString(16);
	var rl = r.length;
	var r2 = "";
	for(i=0;i<rl;i+=2) r2+= r[rl-i-2]+r[rl-i-1];
	return r2;

}


