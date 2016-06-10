
var selfStatus = {versionNO:'',IPaddress:'',portNO:''};
if(process.argv.length < 3)
{
	console.log("no version number provided in argument line");
	process.exit(1);	
} 
else selfStatus.versionNO = process.argv[2];
selfStatus.portNO = 8008;

// process.on("SIGABRT",function(){process.exit(8)});

var server = require("./servers/servers.js").startservers(selfStatus);

current = new Date();
next_day = current.getDate() + 1;
tomorrow = new Date(current.getFullYear(),current.getMonth(),next_day);
setTimeout(function(){process.exit(1);},Date.parse(tomorrow) - Date.parse(current));



