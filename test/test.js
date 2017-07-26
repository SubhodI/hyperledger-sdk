var sdk= require("../index.js");
helper=sdk.helper;
channel=sdk.channel;
chaincode=sdk.chaincode;
helper.setChain("/root/hyperledger/hyperledger-sdk/test/network-config.json","/root/hyperledger/hyperledger-sdk/test/config.json");

//console.log(helper.getORGS());

//channel.createChannel("firstchannel","/root/hyperledger/hyperledger-sdk/test/channel-artifacts/channel.tx","admin","org1");

// channel.joinChannel("firstchannel", ["localhost:7051","localhost:8051"], "admin", "org1")
// 	.then(function(message) {
// 		console.log(message);
// 	});


//chaincode.installChaincode(["localhost:7051","localhost:8051"], "helloworld", "example_cc.go","v0", "admin", "org1");
// file shoulld be inside config.GOPATH/src/example_cc.go

//chaincode.instantiateChaincode("firstchannel", "helloworld", "v0", "init", ["a","100","b","200"],"admin", "org1");
//error: chaincode name issue

//invokeChaincode(["localhost:7051", "localhost:7056"], "mychannel", "mycc", "move", ["a","b","10"], "admin", "org1")
//console.log(queryChaincode("peer1","mychannel","mycc", ['a'], "query", "admin", "org1"));
//invokeChaincode(["localhost:7051", "localhost:7056"], "mychannel", "mycc", "move", ["a","b","10"], "admin", "org1")