var sdk= require("../index.js");
helper=sdk.helper;
helper.setChain("/root/hyperledger/hyperledger-sdk/test/network-config.json","/root/hyperledger/hyperledger-sdk/test/config.json");
console.log(helper.getORGS());
// setTimeout(function() {
//     console.log(sdk);    
// }, 9000);
