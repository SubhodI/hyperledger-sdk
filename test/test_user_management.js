var sdk= require("../index.js");
helper=sdk.helper;

// Set network-Config and sdk config path
helper.setChain("/root/workspace/hyperledger/hyperledger-sdk/test/network-config.json","/root/workspace/hyperledger/hyperledger-sdk/test/config.json");

user=sdk.user;
// SDK 
//console.log(sdk);


	
// Step 1: 

// Register new User
sdk.helper.getRegisteredUsers("admin", 'org1', true).then(function(response) {
		if (response && typeof response !== 'string') {
			console.log(response);
		} else {
			console.log(response);
		}
	});

	
	
// Step 2: 
// Create channel "firstchannel" 

//channel.createChannel("firstchannel","/root/workspace/hyperledger/hyperledger-sdk/test/channel-artifacts/channel.tx","admin","org1");

//step 3:
// join channel "firstchannel" 

//channel.joinChannel("firstchannel", ["localhost:7051","localhost:8051"], "admin", "org1")
	// .then(function(message) {
		// console.log(message);
	// });
	
//step 4:	
// Install chaincode on peer
		
	// sdk.chaincode.installChaincode(["localhost:7051","localhost:8051"], 'mycc',"example_cc.go", 'v0', "admin", 'org1')
	// .then(function(message) {
		// console.log(message);
	// });
	

	
	
// Query
// user.query.getBlockByNumber("peer2", 1, "admin", 'org1')
		// .then(function(message) {
			// console.log(message)
		// });






