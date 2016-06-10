var actions = require("./actions.js");
var models = require("./database.js").modelCollection;

exports.startservers = function(selfdetail) {
	var snModel = models.snModel,
		wifiModel = models.wifiModel; 
	var app = require('express')();
	httpserver = app.listen(selfdetail.portNO,function(){
		console.log("http server is started ");
	});

	app.get("/upload",function(request,response){
		actions.IMEI_add(request,response,snModel);
	});

	app.get("/download",function(request,response){
		actions.downloadfile(request,response);
	});

	app.get("/wifi",function(request,response){
		actions.WIFI_add(request, response,wifiModel);
	});
	
	app.get("/dup",function(request,response){
		actions.duplicated(request, response,snModel);
	});

	sendMsg = JSON.stringify(selfdetail);	
	
	var server = require("dgram").createSocket('udp4');
	server.bind(function(){
		server.setBroadcast(true);
	    server.setMulticastTTL(24);
	    server.setMulticastLoopback(true);
	});

	server.on('listening', function() {
		var address = server.address();
		console.log("UDP server listening on:" + address.port);
	});

    intevalBroadcast = setInterval(broadcastNew, 1*1000);
    function broadcastNew() {        
        server.send(sendMsg, 0,sendMsg.length, 9900,"230.1.2.3");
        // console.log("Sending self_status");
    }	
};

