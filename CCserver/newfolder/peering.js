
var functions = require('./functions.js');
var clientFunction = require("./to_client.js"); 
var selfBeMaster = 3;
var selfStatus = {type:'CCserver'
                ,IPaddress:''
                ,startTime:0
                ,missMessge:3
                };
var masterServer;//only store one premium server
var others = [];
exports.peering = function(peerConfig,userConfig,productConfig){
    var server_peer = require('dgram').createSocket("udp4");
    var client_peer = require("dgram").createSocket("udp4");
    var autoProduct = require("dgram").createSocket("udp4");
    var clients = clientFunction.openClient(userConfig,productConfig); 
    clientFunction.freshProductList(clients.products,productConfig);
    selfStatus.startTime = process.argv[2]||Date.now();    
    
    server_peer.bind(function(){
      server_peer.setBroadcast(true);
      server_peer.setMulticastTTL(24);
      server_peer.setMulticastLoopback(true); 
      console.log("server_peer:" + JSON.stringify(server_peer.address()));
    });    

    broadcastNew = function(){
        var mm = JSON.stringify(selfStatus);
        server_peer.send(mm, 0, mm.length, peerConfig.sendPort,peerConfig.sendAddress);
    }
    notation = function(){
        var mm = JSON.stringify(selfStatus);
        server_peer.send(mm, 0, mm.length, 11000,"192.168.0.255");
    }
    intervalBroadcast = setInterval(broadcastNew, peerConfig.multicastTimer);
    setInterval(notation,5*1000);

    intervalCheck = setInterval(addMissMessage,peerConfig.checkTimer);
    function addMissMessage(){
      checking(clients,broadcastNew);      
    }

    client_peer.bind(peerConfig.listenPort,function(){
      client_peer.addMembership(peerConfig.listenAddress);
      console.log("client:" + JSON.stringify(client_peer.address()));     
    });

    client_peer.on("message",function(msg,rinfo){

      var remote = functions.isPeerMessage(msg,rinfo);
      if (remote == undefined) return;
      freshMasterStatus(remote,clients); 
    });

    autoProduct.bind(11000,function(){
      console.log("client:" + JSON.stringify(autoProduct.address()));
      autoProduct.on("message",function(msg,rinfo){
            var remote = functions.isPeerMessage(msg,rinfo);
            if (remote == undefined) {
                console.log("unexpected message");
                return;
            }
            addOthers(remote);
        });
    });   
    
}


function checking(clients,broadcastNew){
  if(masterServer == undefined )
  {
    if(selfBeMaster > 0)
    {
      --selfBeMaster;
      console.log('counting down' + selfBeMaster);
    }
    else 
    {
      masterServer = selfStatus;          
      selfBeMaster = 3;
      if(intervalBroadcast._repeat == false) 
      intervalBroadcast = setInterval(broadcastNew,peerConfig.multicastTimer);
      if( !clients.user._events.hasOwnProperty('message')
        ||!clients.products._events.hasOwnProperty('message'))
          clientFunction.onMessage(clients,userConfig.sendPort);
    }
  }
  else
  {
    if(masterServer.missMessge > 0) --masterServer.missMessge;
    if(masterServer.missMessge <= 0) masterServer = undefined;
  }    
}

function freshMasterStatus(remote,clients){
  if(masterServer == undefined)
  {
    if(remote.startTime >= selfStatus.startTime)
      delete remote;
    else{
      masterServer = remote;
      if(intervalBroadcast._repeat == true)
      clearInterval(intervalBroadcast);
      if(  clients.user._events.hasOwnProperty('message')
        || clients.products._events.hasOwnProperty("message"))
          clientFunction.offMessage(clients);
    }
  }
      
  else
  {
    if(remote.startTime < masterServer.startTime){
      masterServer = remote;
      if(intervalBroadcast._repeat == true) 
        clearInterval(intervalBroadcast);
      if(  clients.user._events.hasOwnProperty('message')
        || clients.products._events.hasOwnProperty("message"))
          clientFunction.offMessage(clients);
    }
    else if(remote.startTime == masterServer.startTime){
      if(masterServer.missMessge < 3)
        ++masterServer.missMessge;
      if(intervalBroadcast._repeat == false 
        && masterServer.startTime == selfStatus.startTime) 
          intervalBroadcast = setInterval(broadcastNew, peerConfig.multicastTimer);
      if(intervalBroadcast._repeat == true 
        && masterServer.startTime != selfStatus.startTime)
          clearInterval(intervalBroadcast);
    }
    else delete remote;
  }
}

function addOthers(remote){
  if(   remote.IPaddress == masterServer.IPaddress
    || remote.startTime == selfStatus.startTime)
        return;
  flag = false;
  for(var i = 0; i < others.length ; i ++){
    if(others[i].IPaddress === remote.IPaddress)
    {
      flag = true;
      break;
    }
    else
      continue;
  }
  if(flag === false) others.push(remote); 
}