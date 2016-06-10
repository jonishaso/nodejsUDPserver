var data = require('fs').readFileSync(__dirname + "/package.json");
jsondata = JSON.parse(data);
peerConfig = jsondata["configure"]["peer"];
productConfig = jsondata["configure"]["product"]
userConfig = jsondata["configure"]["user"]
console.log(process.pid);


require('./servers/peering.js').peering(peerConfig,userConfig,productConfig);

