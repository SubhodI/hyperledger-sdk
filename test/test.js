var sdk= require("../index.js");
helper=sdk.helper;
channel=sdk.channel;
chaincode=sdk.chaincode;
user= sdk.user;
helper.setChain("/root/hyperledger/hyperledger-sdk/test/network-config.json","/root/hyperledger/hyperledger-sdk/test/config.json");


// Channel API's
        //channel.createChannel("mychannel","/root/hyperledger/hyperledger-sdk/test/artifacts/channel/mychannel.tx","admin","org1");

        // channel.joinChannel("business", ["localhost:7051","localhost:7056"], "admin", "org1")
        // 	.then(function(message) {
        // 		console.log(message);
        // 	});

//  Chaincode API's
        //chaincode.installChaincode(["localhost:7051","localhost:7056"], "mycc", "github.com/example_cc","v1", "admin", "org1");
        // file shoulld be inside config.GOPATH/src/example_cc.go

        //chaincode.instantiateChaincode("business", "mycc", "v1", "init", ["a","100","b","200"],"admin", "org1");
        //error: chaincode name issue

   //     chaincode.queryChaincode("peer1","mychannel","mycc", ['a'], "query", "anwith", "org1"))
   

    //    chaincode.invokeChaincode(["localhost:7051", "localhost:7056"], "business", "mycc", "move", ["a","b","10"], "anwith", "org1")
        //Query for a after move
        //console.log(chaincode.queryChaincode("peer1","mychannel","mycc", ['a'], "query", "admin", "org1"));

//  User API's
//    sdk.helper.getRegisteredUsers("anwith", 'org1', true).then(function(response) {
// 		if (response && typeof response !== 'string') {
// 			console.log(response);
// 		} else {
// 			console.log(response);
// 		}
// 	});

