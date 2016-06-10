/*
var database = require("./servers/database.js");
var db = require("mongodb").db;

database.connectDB();
console.log(database.configFileContent);

var dbu;
database.mongoclient.open(function(err,mongoclient)
 {
   dbu = database.mongoclient.db(database.configFileContent.DBurl);
   dbu.collection(database.configFileContent.tableName).find(cllbck(err)).toArray(function(err,each){console.log(each);});
			// dbu.collection(database.configFileContent.tableName).findOne({IMEI:2},function(err,data){console.log(data);cllbck(err);});									
});

// toArray(function(err,each){console.log(each);});

function cllbck(err){
	if(err){console.log("unable to do that");}
	else {console.log("successful action cheers !!!")}
}
*/

/*

console.log(__dirname);
console.log(__dirname.substr(-(__dirname.length),3));
console.log(__dirname.substr(0,(__dirname.length - 13)));

oneday = new Date();
console.log(oneday);
date = oneday.getFullYear() + "_" + (oneday.getMonth()+1) + "_" + oneday.getDate();
console.log(date);

twoday = new Date(oneday.getFullYear(),oneday.getMonth(),oneday.getDate()+1);
console.log(twoday);
console.log(Date.parse(twoday) - Date.parse(oneday));

setTimeout(printout,Date.parse(twoday) - Date.parse(oneday));
function printout(){console.log("setTimeout(function() {}, 10);");}

*/


// the code below is used for system responding speed

var request = require("request");
var prefix = "http://192.168.24.124:8008/upload?SN=";
var option = { method: 'GET'
		  	   ,headers:{
		  	   	"Accept-language":"en-US"
		  		}
			}
var alph_list = ['a','b','c','d','e','f','g'];
var leng = alph_list.length;			

function send_request(){
	var sn = process.argv[4]||Math.floor(Math.random()*1000);
	var information = '';
	for(var i = 0; i <19; i++)
	{
		information += alph_list[Math.floor(Math.random()*leng)];
	}
	var url_string = prefix + sn + "&information=" + information;
	option["url"] = url_string;
	request(option,function(error, response, body)
			{
				if(!error&&response.statusCode === 200)
					console.log(body);
			});
}

function duplicate()
{
	var pre = "http://192.168.24.124:8008/dup?SN=";
	for(var i = 0; i < 1000; i++)
	{
		option["url"] = pre + i;
		request(option,function(error, response, body)
			{if(error) console.log(error);});
	}
}


// var interval = setInterval(send_request,1000/process.argv[2]);
// setTimeout(function(){clearInterval(interval);},process.argv[3]*1000);

// duplicate();