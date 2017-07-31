var sdk = require("../index.js");
helper = sdk.helper;
channel = sdk.channel;
chaincode = sdk.chaincode;
user = sdk.user;
chain = sdk.chain;

helper.setChain("/root/hyperledger/hyperledger-sdk/test/network-config.json", "/root/hyperledger/hyperledger-sdk/test/config.json");


// Channel API's
// channel.createChannel("mychannel", "/root/hyperledger/hyperledger-sdk/test/artifacts/channel/mychannel.tx", "Gyan", "org2").then(function (response) {
//         console.log(response);
// }).catch(function (error) {
//         console.log(error);
// });

// channel.joinChannel("mychannel", ["localhost:7051", "localhost:7056"], "admin", "org1")
//         .then(function (message) {
//                 console.log(message);
//         }).catch(function (error) {
//                 console.log(error);
//         });

//  Chaincode API's
//chaincode.installChaincode(["localhost:7051","localhost:7056"], "mycc", "github.com/example_cc","v1", "admin", "org1");
// file shoulld be inside config.GOPATH/src/example_cc.go

//chaincode.instantiateChaincode("business", "mycc", "v1", "init", ["a","100","b","200"],"admin", "org1");
//error: chaincode name issue

     //chaincode.queryChaincode("peer1","mychannel","mycc", ['a'], "query", "Gyan", "org1")


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

// user.registerEnrollUser("Gyan","org2")
// .then(function(response){
//         console.log(response);
// }).catch(function(error){
//         console.log(error);
// });     

// user.enrollUser("Gyan","TigqtAdQAZii","csr","org2")
// .then(function(response){
//         console.log(response);
// }).catch(function(error){
//         console.log(error);
// });


// user.revokeUser("Gyan",null, 0, "org2")
// .then(function(response){
//         console.log(response);
// }).catch(function(error){
//         console.log(error);
// });



//chain.getChainInfo("peer1", "Gyan", "org2")
