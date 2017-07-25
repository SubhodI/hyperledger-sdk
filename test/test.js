var sdk= require("../index.js");
helper=sdk.helper;
channel=sdk.channel;

helper.setChain("/root/hyperledger/hyperledger-sdk/test/network-config.json","/root/hyperledger/hyperledger-sdk/test/config.json");

//console.log(helper.getORGS());

//channel.createChannel("firstchannel","/root/hyperledger/hyperledger-sdk/test/channel-artifacts/channel.tx","admin","org1");

// channel.joinChannel("firstchannel", ["localhost:7051","localhost:8051"], "admin", "org1")
// 	.then(function(message) {
// 		console.log(message);
// 	});