
exports.isPeerMessage = function(msg,rinfo){
	try{     
      remote = JSON.parse(msg);
      if(	!remote.hasOwnProperty('type') &&
        	!remote.hasOwnProperty('IPaddress') &&
        	!remote.hasOwnProperty('startTime') &&
        	!remote.hasOwnProperty('missMessge')) throw err;
      if(remote.type != 'CCserver') throw err;
      remote.IPaddress = rinfo.address; 
      return remote;
  }
  catch(err){
      return undefined;
  }
}
