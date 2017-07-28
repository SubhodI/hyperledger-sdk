var sdk= require("../index.js");
helper=sdk.helper;
channel=sdk.channel;
chaincode=sdk.chaincode;
helper.setChain("/root/hyperledger/hyperledger-sdk/test/network-config.json","/root/hyperledger/hyperledger-sdk/test/config.json");

//console.log(helper.getORGS());

//channel.createChannel("mychannel","/root/hyperledger/hyperledger-sdk/test/artifacts/channel/mychannel.tx","admin","org1");

// channel.joinChannel("business", ["localhost:7051","localhost:7056"], "admin", "org1")
// 	.then(function(message) {
// 		console.log(message);
// 	});


//chaincode.installChaincode(["localhost:7051","localhost:7056"], "mycc", "github.com/example_cc","v1", "admin", "org1");
// file shoulld be inside config.GOPATH/src/example_cc.go

//chaincode.instantiateChaincode("business", "mycc", "v1", "init", ["a","100","b","200"],"admin", "org1");
//error: chaincode name issue

//chaincode.invokeChaincode(["localhost:7051", "localhost:7056"], "firstchannel", "mycc", "move", ["a","b","10"], "admin", "org1")
console.log(chaincode.queryChaincode("peer1","mychannel","mycc", ['b'], "query", "admin", "org1"));
//invokeChaincode(["localhost:7051", "localhost:7056"], "mychannel", "mycc", "move", ["a","b","10"], "admin", "org1")