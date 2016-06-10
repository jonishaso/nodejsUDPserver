
var functions = require("./functions.js");
var proServerList = [];
var productStartUp = [];//one and only element
var CClist = [];
var freshList = [];//first for product list,second for CC list
var isMaster = false;
var localIP = [];

exports.openClient = function(userConfig,productConfig,peerConfig)
{

  localIP = getLocalIP();
  console.log(localIP);
  var client_user = require("dgram").createSocket("udp4");
  client_user.bind({port:userConfig.listenPort},function(){
    client_user.addMembership(userConfig.listenAddress);
  });
  client_user.on("listening",function(){
      console.log("client_user listening .....");
  });    
  
  var client_product = require("dgram").createSocket("udp4");
  client_product.bind({port:productConfig.listenPort},function(){    
    client_product.addMembership(productConfig.listenAddress);
  });
  client_product.on("listening",function(){
      console.log("client_product listening .....");
  });
  
  var client_CClist = require("dgram").createSocket("udp4");
  client_CClist.bind({port:peerConfig.heartBeatPort},function(){
    client_CClist.addMembership(peerConfig.heartBeatAddress);
  });
  client_CClist.on("listening",function(){
      console.log("client_CClist listening.....");
  });

  var auto = require("dgram").createSocket("udp4");
  auto.bind({port:9999});
  auto.on("message",function(msg,rinfo){
    if(isMaster == true) return;
    else autoOpen(msg);
  });

  var client = {user:client_user
                ,products:client_product
                ,CClist:client_CClist
                ,auto:auto};
  return client;
}  

exports.onMessage = function(clients)
{
  if(productStartUp[0]!=undefined&&productStartUp[0].hasOwnProperty('pid'))
  { 
    process.kill(productStartUp[0].pid,"SIGINT");
    // productStartUp[0].kill("SIGABRT");
    productStartUp.pop();
  }  
  clients.user.on("message",function(msg,rinfo){
      infomation = selectProServer(msg,rinfo,clients.user);
      if(undefined != infomation)
      {
        mm = information.IPaddress + ":" + information.portNO;
        clients.user.send(mm, 0, mm.length, 9000, rinfo.address);
      } 
      console.log("received user request from " + rinfo.address);
  });

  clients.products.on("message",function(msg,rinfo){
    addProductList(msg,rinfo);
    // console.log(proServerList);
  });

  clients.CClist.on("message",function(msg,rinfo){
    addCClist(msg,rinfo);
    // console.log(CClist);
  });

  freshList.push(freshProductList(clients.products));
  freshList.push(freshCCList(clients.CClist));
  isMaster = true;
  console.log("---------clients is on message----------");
}

exports.offMessage = function(clients)
{
  if(clients.user._events.hasOwnProperty('message'))
    delete clients.user._events.message;
  if(clients.products._events.hasOwnProperty('message'))
    delete clients.products._events.message;
  if(clients.CClist._events.hasOwnProperty('message'))
    delete clients.CClist._events.message;
  if(freshList[0]._repeat == true)
    clearInterval(freshList[0]);
  if(freshList[1]._repeat == true)
    clearInterval(freshList[1]);
  isMaster = false;
  console.log("--------clients is off message-----------");
}

getLocalIP = function()
{
  var ifaces = require("os").networkInterfaces();
  var ipList = [];
  Object.keys(ifaces).forEach(function (ifname)
  {
    var alias = 0;
    ifaces[ifname].forEach(function (iface)
    {
      if ('IPv4' !== iface.family || iface.internal !== false) return;
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      // if (alias >= 1) this single interface has multiple ipv4 addresses
      else
        ipList.push(iface.address);           
    });
  });
  return ipList;
}


autoOpen = function(num)
{
  var sp = require('child_process').spawn;
  var server = sp('node',["../Product/index.js",num]
              ,{stdio:['ignore',process.stdout,process.stderr]});
  productStartUp.push( server );
  console.log("child process id :" + productStartUp[0].pid);
}

function freshProductList(client)
{
  return setInterval(cleanList, 5*1000);        
  function cleanList()
  {
    if(client._events.hasOwnProperty("message"))
    {
      delete client._events.message;
      proServerList.forEach(function(detail){
        proServerList.pop(detail);
      });    
      if(0 == proServerList.length)
      {
        // console.log("deleting ..........");
        client.on("message",function(msg,rinfo)
        {
          addProductList(msg,rinfo);
          // console.log(proServerList);
        });
      }
    } 
    else
      return;     
  }
}

function freshCCList(client)
{
  return setInterval(cleanList, 5*1000);        
  function cleanList()
  {
    if(client._events.hasOwnProperty("message"))
    {
      delete client._events.message;
      CClist.forEach(function(detail){
        CClist.pop(detail);
      });    
      if(0 == CClist.length)
      {
          console.log("deleting ..........");
          client.on("message",function(msg,rinfo)
          { 
            addCClist(msg,rinfo);
            // console.log(CClist);
          });  
      }
    } 
    else
      return;     
  }
}


function addCClist(msg, rinfo)
{
  for(var i =0; i < localIP.length; i++)
  {
    if(rinfo.address === localIP[i])
       return;
    else 
      continue;
  }
  var remote = functions.isPeerMessage(msg,rinfo);
  if (remote == undefined) {
        console.log("client CCList received an unexpected message");
        return;
  }
  flag = false;
  for(var i = 0; i < CClist.length ; i ++){
    if(CClist[i].IPaddress === remote.IPaddress)
    {
      flag = true;
      break;
    }
    else
      continue;
  }
  if(flag === false) CClist.push(remote); 
}


function addProductList(msg,rinfo)
{
    try{
      var remote = JSON.parse(msg);
      if(!remote.hasOwnProperty("versionNO") &&
         !remote.hasOwnProperty("IPaddress") &&
         !remote.hasOwnProperty("portNO") ) throw new err;
    }
    catch(e){
      console.log("client product received an unexpected message");
      return;
    }

    remote.IPaddress = rinfo.address;
    flag = false;
    if(proServerList.length == 0){
      proServerList.push(remote);
    }
    else{
      for(var i = 0; i < proServerList.length ; i++){
        if(remote.versionNO == proServerList[i].versionNO &&
          remote.IPaddress == proServerList[i].IPaddress &&
          remote.portNO == proServerList[i].portNO)
        {
          flag = true;
          break;
        }
        else continue;
      }
      if(false == flag) proServerList.push(remote);
    }
}

function selectProServer(msg,rinfo,client)
{
  try
  {
    var remote = JSON.parse(msg);
    if(!remote.hasOwnProperty("Product"))
      throw err;
  }
  catch(e)
  {
    console.log("client_user received a unexpected message");
    return;
  }
  var version = remote.Product.toString();
  for(var i = 0; i < proServerList.length; i++)
  {
    if(version == proServerList[i].versionNO)
    {
      console.log("send product server information ");
      return proServerList[i];
    }
    else
      continue;
  }
  startRemoteProServer(version,clients);
  return undefined;
}

function startRemoteProServer(version,client)
{
  for(var i = 0; i < CClist.length; i++)
  {
    if(CClist[i].type == "CCserver")
    {
      client.send(version,0,version.length,9999,CClist.[i].IPaddress);
      console.log("start up a new product server :" + version);
      return;
    }
    else
      continue;
  }
  console.log("there is not sufficient server ");
}
