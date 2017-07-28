/**
 * @file Channel 
 * @author Siddesh Sangodkar <siddesh226@gmail.com>
 * @version 0.1
 */

var util = require('util');
var fs = require('fs');
var path = require('path');
// var config = require('../config.json');
var helper = require('./helper.js');
var logger = helper.getLogger('Channel');

var Peer = require('fabric-client/lib/Peer.js');
var EventHub = require('fabric-client/lib/EventHub.js');
var tx_id = null;
var nonce = null;
var allEventhubs = [];


/**
 * Create Channel Function
 *
 */


//Attempt to send a request to the orderer with the sendCreateChain method
var createChannel = function (channelName, channelConfigPath, username, orgName) {
	logger.debug('\n====== Creating Channel \'' + channelName + '\' ======\n');
	var client = helper.getClientForOrg(orgName);
	var channel = helper.getChannelForOrg(orgName);

	// read in the envelope for the channel config raw bytes
	var envelope = fs.readFileSync(channelConfigPath);
	// extract the channel config bytes from the envelope to be signed
	var channelConfig = client.extractChannelConfig(envelope);

	//Acting as a client in the given organization provided with "orgName" param
	return helper.getOrgAdmin(orgName).then((admin) => {
		logger.debug(util.format('Successfully acquired admin user for the organization "%s"', orgName));
		// sign the channel config bytes as "endorsement", this is required by
		// the orderer's channel creation policy
		let signature = client.signChannelConfig(channelConfig);

		let request = {
			config: channelConfig,
			signatures: [signature],
			name: channelName,
			orderer: channel.getOrderers()[0],
			txId: client.newTransactionID()
		};

		// send to orderer
		return client.createChannel(request);
	}, (err) => {
		logger.error('Failed to enroll user \'' + username + '\'. Error: ' + err);
		throw new Error('Failed to enroll user \'' + username + '\'' + err);
	}).then((response) => {
		logger.debug(' response ::%j', response);
		if (response && response.status === 'SUCCESS') {
			logger.debug('Successfully created the channel.');
			let response = {
				success: true,
				message: 'Channel \'' + channelName + '\' created Successfully'
			};
			return response;
		} else {
			logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName +
				'\' !!!!!!!!!\n\n');
			throw new Error('Failed to create the channel \'' + channelName + '\'');
		}
	}, (err) => {
		logger.error('Failed to initialize the channel: ' + err.stack ? err.stack :
			err);
		throw new Error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
	});
};


/**
 * Join Channel Function
 *
 */

var joinChannel = function (channelName, peers, username, org) {
	// on process exit, always disconnect the event hub
	var ORGS = helper.getORGS();
	var config = helper.getConfig();
	var closeConnections = function (isSuccess) {
		if (isSuccess) {
			logger.debug('\n============ Join Channel is SUCCESS ============\n');
		} else {
			logger.debug('\n!!!!!!!! ERROR: Join Channel FAILED !!!!!!!!\n');
		}
		logger.debug('');
		for (var key in allEventhubs) {
			var eventhub = allEventhubs[key];
			if (eventhub && eventhub.isconnected()) {
				//logger.debug('Disconnecting the event hub');
				eventhub.disconnect();
			}
		}
	};
	//logger.debug('\n============ Join Channel ============\n')
	logger.info(util.format(
		'Calling peers in organization "%s" to join the channel', org));

	var client = helper.getClientForOrg(org);
	var channel = helper.getChannelForOrg(org);
	var eventhubs = [];

	return helper.getOrgAdmin(org).then((admin) => {
		logger.info(util.format('received member object for admin of the organization "%s": ', org));
		tx_id = client.newTransactionID();
		let request = {
			txId: tx_id
		};

		return channel.getGenesisBlock(request);
	}).then((genesis_block) => {
		tx_id = client.newTransactionID();
		var request = {
			targets: helper.newPeers(peers),
			txId: tx_id,
			block: genesis_block
		};

		for (let key in ORGS[org]) {
			if (ORGS[org].hasOwnProperty(key)) {
				if (key.indexOf('peer') === 0) {
					let data = fs.readFileSync(path.join(__dirname, ORGS[org][key][
						'tls_cacerts'
					]));
					let eh = client.newEventHub();
					eh.setPeerAddr(ORGS[org][key].events, {
						pem: Buffer.from(data).toString(),
						'ssl-target-name-override': ORGS[org][key]['server-hostname']
					});
					eh.connect();
					eventhubs.push(eh);
					allEventhubs.push(eh);
				}
			}
		}

		var eventPromises = [];
		eventhubs.forEach((eh) => {
			let txPromise = new Promise((resolve, reject) => {
				let handle = setTimeout(reject, parseInt(config.eventWaitTime));
				eh.registerBlockEvent((block) => {
					clearTimeout(handle);
					// in real-world situations, a peer may have more than one channels so
					// we must check that this block came from the channel we asked the peer to join
					if (block.data.data.length === 1) {
						// Config block must only contain one transaction
						var channel_header = block.data.data[0].payload.header.channel_header;
						if (channel_header.channel_id === channelName) {
							resolve();
						} else {
							reject();
						}
					}
				});
			});
			eventPromises.push(txPromise);
		});
		let sendPromise = channel.joinChannel(request);
		return Promise.all([sendPromise].concat(eventPromises));
	}, (err) => {
		logger.error('Failed to enroll user \'' + username + '\' due to error: ' +
			err.stack ? err.stack : err);
		throw new Error('Failed to enroll user \'' + username +
			'\' due to error: ' + err.stack ? err.stack : err);
	}).then((results) => {
		logger.debug(util.format('Join Channel R E S P O N S E : %j', results));
		if (results[0] && results[0][0] && results[0][0].response && results[0][0]
			.response.status == 200) {
			logger.info(util.format(
				'Successfully joined peers in organization %s to the channel \'%s\'',
				org, channelName));
			closeConnections(true);
			let response = {
				success: true,
				message: util.format(
					'Successfully joined peers in organization %s to the channel \'%s\'',
					org, channelName)
			};
			return response;
		} else {
			logger.error(' Failed to join channel');
			closeConnections();
			throw new Error('Failed to join channel');
		}
	}, (err) => {
		logger.error('Failed to join channel due to error: ' + err.stack ? err.stack :
			err);
		closeConnections();
		throw new Error('Failed to join channel due to error: ' + err.stack ? err.stack :
			err);
	});
};

var getChannels = function(peer, username, org) {
	var target = helper.buildTarget(peer, org);
	var channel = helper.getChannelForOrg(org);
	var client = helper.getClientForOrg(org);

	return helper.getRegisteredUsers(username, org).then((member) => {
		//channel.setPrimaryPeer(targets[0]);
		return client.queryChannels(target);
	}, (err) => {
		logger.info('Failed to get submitter "' + username + '"');
		return 'Failed to get submitter "' + username + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response) => {
		if (response) {
			logger.debug('<<< channels >>>');
			var channelNames = [];
			for (let i = 0; i < response.channels.length; i++) {
				channelNames.push('channel id: ' + response.channels[i].channel_id);
			}
			logger.debug(channelNames);
			return response;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
};


module.exports = {
	createChannel: createChannel,
	joinChannel: joinChannel,
	getChannels:getChannels

}
