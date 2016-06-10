
var functions = require("./functions.js");
var proServerList = [];
var productStartUp = [];

exports.openClient = function(userConfig,productConfig){
  var client_user = require("dgram").createSocket("udp4");
  client_user.bind({port:userConfig.listenPort},function(){
    client_user.addMembership(userConfig.listenAddress);
  });    
  client_user.on("listening",function(){
    console.log("cklient_user listening .....");
  });

  var client_product = require("dgram").createSocket("udp4");
  client_product.bind({port:productConfig.listenPort},function(){    
    client_product.addMembership(productConfig.listenAddress);
  });
  client_product.on("listening",function(){
    console.log("client_product listening .....");
  });

  var client = {user:client_user,products:client_product};
  return client;
}  

exports.onMessage = function(clients,sendport,server){
  
  if(productStartUp[0]!=undefined&&productStartUp[0].hasOwnProperty('pid'))
  { 
    process.kill(productStartUp[0].pid,"SIGINT");
    productStartUp.pop();
  }  
  clients.user.on("message",function(msg,rinfo){
      // if(0 == proServerList.length) 
        // server.send(msg, 0 , msg.length , 11000 , "230.1.2.5");/////////
      mm = "192.168.24.126:4000";
      clients.user.send(mm , 0 , mm.length ,sendport,rinfo.address);
      console.log("receiving....");
  });
  clients.products.on("message",function(msg,rinfo){
    functions.productServerList_add(msg,rinfo,proServerList);
    console.log(proServerList);
  });
  console.log("---------clients is on message----------");
}

exports.offMessage = function(clients){
  if(clients.user._events.hasOwnProperty('message'))
    delete clients.user._events.message;
  if(clients.products._events.hasOwnProperty('message'))
    delete clients.products._events.message;
  console.log("--------clients is off message-----------");
}

exports.autoOpen = function(num){
  var sp = require('child_process').spawn;
  var server = sp('node',["../Product/index.js",num]);
  productStartUp.push( server );
  console.log("child process id :" + productStartUp[0].pid);
}

exports.freshProductList = function(client,productConfig)
{
  refreshProServerList = setInterval(cleanList, productConfig.freshListInterval);        
  function cleanList() {
    if(client._events.hasOwnProperty("message")){
      delete client._events.message;
      proServerList.forEach(function(detail){proServerList.pop(detail);});    
      if(0 == proServerList.length){
          console.log("deleting ..........");
          client.on("message",function(msg,rinfo){
          functions.productServerList_add(msg,rinfo,proServerList);
          console.log(proServerList);
        });
      }
    } 
    else
      return;     
  }
}



/*
refreshProServerList = setInterval(cleanList, 5*1000);        
function cleanList(){console.log(proServerList);}
*/