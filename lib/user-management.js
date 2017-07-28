/**
 * @file User management 
 * @author Siddesh Sangodkar <siddesh226@gmail.com>
 * @version 0.1
 */

'use strict';
/*
var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var helper = require('./helper.js');

var logger = helper.getLogger('query-invoke-chaincode');
var EventHub = require('fabric-client/lib/EventHub.js');
*/



/**
 *  

registerEnrollUser -  Register / Enroll New Member.
 * @param {string} peer - peer description.
 * @param {string} username - username .
 * @param {string} org - organisation.
 */
 
var registerEnrollUser = function(username, org) {
	
    helper.getRegisteredUsers("admin", 'org1', true).then(function(response) {
		if (response && typeof response !== 'string') {
			return response;
		} else {
		var res={
				success: false,
				message: response
			};
			
			return res;
		}
	});
	
	
	
};


/**
 *  
 


setDataObject - Store data object in Chaincode.

 */
 
var setDataObject = function(peer, trxnID, username, org) {
	
};

/**
 *  
 
getDataObject -  Get data Object from chaincode.

 */
var getDataObject = function() {
	
};



/**
 *  
 

verifyDataObject -  Verify data Object.
 * @param {string} dataObject - peer description.
 * @param {string} hash - username .

 */
var verifyDataObject = function(dataObject, hash) {
	
};


/**
 *  
 


getObjectTrail - Get audit trails of object.
 * @param {string} objectId - peer description.

 */
var getObjectTrail = function(objectId) {
	
};









module.exports =
    {
		registerEnrollUser:	registerEnrollUser,
		setDataObject : setDataObject,
		getDataObject : getDataObject,
		verifyDataObject : verifyDataObject,
		getObjectTrail : getObjectTrail
	};
	
	