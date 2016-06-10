
var modelCollection = {};


	try
	{
		var mongoose = require("mongoose"),
		schema1 = mongoose.Schema,
		schema2 = mongoose.Schema;

		oneday = new Date();
		date =  oneday.getFullYear() + "-"+(oneday.getMonth()+1) + "-"+oneday.getDate();

		database_name = "mongodb://localhost/" + process.argv[2]+ "--" + date;
		mongoose.connect(database_name);

		var snSchema = new schema1({
		 	SN : String,
			time : {type:Date, defualt:Date.now()},
			extral : String	
		});
		var wifiSchema = new schema2({
			SN : String,
			time : {type:Date, defualt:Date.now()},
			result : String
		});

		modelCollection.snModel  = mongoose.model("imei_sn",snSchema);
		modelCollection.wifiModel = mongoose.model("wifi",wifiSchema);
		console.log("database start up successfully");
	}
	catch(e)
	{
		console.log(e);
		console.log("unable to configure database");
		process.exit(1);
	}


exports.modelCollection = modelCollection;