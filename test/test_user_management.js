var sdk= require("../index.js");
helper=sdk.helper;
helper.setChain("/root/workspace/hyperledger/hyperledger-sdk/test/network-config.json","/root/workspace/hyperledger/hyperledger-sdk/test/config.json");
console.log(sdk);
user=sdk.user;
console.log(sdk.user);



// Register new User
// sdk.helper.getRegisteredUsers("Jim", 'org1', true).then(function(response) {
		// if (response && typeof response !== 'string') {
			// console.log(response);
		// } else {
			// console.log(response);
		// }
	// });

	
// install chaincode
		
	sdk.chaincode.installChaincode(["localhost:7051","localhost:8051"], 'mycc',"example_cc.go", 'v0', "Jim", 'org1')
	.then(function(message) {
		console.log(message);
	});
	
	

	
	
	
	
// user.query.getBlockByNumber("peer1", 1, "Jim", 'org1')
		// .then(function(message) {
			// console.log(message)
		// });






