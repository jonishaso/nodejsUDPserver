
var functions = require('./functions.js');
var clientFunction = require("./to_client.js"); 
var selfBeMaster = 3;
var selfStatus = {type:'CCserver'
                ,IPaddress:''
                ,startTime:0
                ,missMessge:3
                };
var masterServer;//only store one premium server
exports.peering = function(peerConfig,userConfig,productConfig)
{
    selfStatus.startTime = process.argv[2]||Date.now();
    var peer_server = require('dgram').createSocket("udp4");
    var client_peer = require("dgram").createSocket("udp4");
    var clients = clientFunction.openClient(userConfig,productConfig,peerConfig); 
    
    peer_server.bind(function(){
      peer_server.setBroadcast(true);
      peer_server.setMulticastTTL(24);
      peer_server.setMulticastLoopback(true); 
      console.log("peer_server:" + JSON.stringify(peer_server.address()));
    });    
    intervalBroadcast = setInterval(broadcastNew, peerConfig.multicastTimer);
    function broadcastNew(){
        var mm = JSON.stringify(selfStatus);
        peer_server.send(mm, 0, mm.length, peerConfig.sendPort,peerConfig.sendAddress);
    }
    intervalHeartBeat = setInterval(heartBeat,peerConfig.heartBeatTimer);
    function heartBeat(){
        var mm = JSON.stringify(selfStatus);
        peer_server.send(mm, 0, mm.length, peerConfig.heartBeatPort,peerConfig.heartBeatAddress);
    }
    
    
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
          clientFunction.onMessage(clients);
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
    }
    else delete remote;
  }
}

