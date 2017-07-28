'use strict';
var path = require('path');
var fs = require('fs');
var util = require('util');
var helper = require('./helper.js');
var logger = helper.getLogger('install-chaincode');
var tx_id = null;
var eh = null;

var installChaincode = function (peers, chaincodeName, chaincodePath,
    chaincodeVersion, username, org) {
    logger.debug(
        '\n============ Install chaincode on organizations ============\n');
    helper.setupChaincodeDeploy();
    var channel = helper.getChannelForOrg(org);
    var client = helper.getClientForOrg(org);

    return helper.getOrgAdmin(org).then((user) => {
        var request = {
            targets: helper.newPeers(peers),
            chaincodePath: chaincodePath,
            chaincodeId: chaincodeName,
            chaincodeVersion: chaincodeVersion
        };
        return client.installChaincode(request);
    }, (err) => {
        logger.error('Failed to enroll user \'' + username + '\'. ' + err);
        throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[0].response &&
                proposalResponses[0].response.status === 200) {
                one_good = true;
                logger.info('install proposal was good');
            } else {
                logger.error('install proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.info(util.format(
                'Successfully sent install Proposal and received ProposalResponse: Status - %s',
                proposalResponses[0].response.status));
            logger.debug('\nSuccessfully Installed chaincode on organization ' + org +
                '\n');
            return 'Successfully Installed chaincode on organization ' + org;
        } else {
            logger.error(
                'Failed to send install Proposal or receive valid response. Response null or status is not 200. exiting...'
            );
            return 'Failed to send install Proposal or receive valid response. Response null or status is not 200. exiting...';
        }
    }, (err) => {
        logger.error('Failed to send install proposal due to error: ' + err.stack ?
            err.stack : err);
        throw new Error('Failed to send install proposal due to error: ' + err.stack ?
            err.stack : err);
    });
};


var instantiateChaincode = function (channelName, chaincodeName, chaincodeVersion, functionName, args, username, org) {
    logger.debug('\n============ Instantiate chaincode on organization ' + org +
        ' ============\n');
    var ORGS = helper.getORGS();
    var channel = helper.getChannelForOrg(org);
    var client = helper.getClientForOrg(org);

    return helper.getOrgAdmin(org).then((user) => {
        // read the config block from the orderer for the channel
        // and initialize the verify MSPs based on the participating
        // organizations
        return channel.initialize();
    }, (err) => {
        logger.error('Failed to enroll user \'' + username + '\'. ' + err);
        throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
    }).then((success) => {
        tx_id = client.newTransactionID();
        // send proposal to endorser
        var request = {
            chaincodeId: chaincodeName,
            chaincodeVersion: chaincodeVersion,
            fcn: functionName,
            args: args,
            txId: tx_id
        };
        return channel.sendInstantiateProposal(request);
    }, (err) => {
        logger.error('Failed to initialize the channel');
        throw new Error('Failed to initialize the channel');
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[0].response &&
                proposalResponses[0].response.status === 200) {
                one_good = true;
                logger.info('instantiate proposal was good');
            } else {
                logger.error('instantiate proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.info(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement
                    .signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var deployId = tx_id.getTransactionID();

            eh = client.newEventHub();
            let data = fs.readFileSync(path.join(__dirname, ORGS[org]['peer1'][
                'tls_cacerts'
            ]));
            eh.setPeerAddr(ORGS[org]['peer1']['events'], {
                pem: Buffer.from(data).toString(),
                'ssl-target-name-override': ORGS[org]['peer1']['server-hostname']
            });
            eh.connect();

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    reject();
                }, 30000);

                eh.registerTxEvent(deployId, (tx, code) => {
                    logger.info(
                        'The chaincode instantiate transaction has been committed on peer ' +
                        eh._ep._endpoint.addr);
                    clearTimeout(handle);
                    eh.unregisterTxEvent(deployId);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        logger.error('The chaincode instantiate transaction was invalid, code = ' + code);
                        reject();
                    } else {
                        logger.info('The chaincode instantiate transaction was valid.');
                        resolve();
                    }
                });
            });

            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat([txPromise])).then((results) => {
                logger.debug('Event promise all complete and testing complete');
                return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
            }).catch((err) => {
                logger.error(
                    util.format('Failed to send instantiate transaction and get notifications within the timeout period. %s', err)
                );
                return 'Failed to send instantiate transaction and get notifications within the timeout period.';
            });
        } else {
            logger.error(
                'Failed to send instantiate Proposal or receive valid response. Response null or status is not 200. exiting...'
            );
            return 'Failed to send instantiate Proposal or receive valid response. Response null or status is not 200. exiting...';
        }
    }, (err) => {
        logger.error('Failed to send instantiate proposal due to error: ' + err.stack ?
            err.stack : err);
        return 'Failed to send instantiate proposal due to error: ' + err.stack ?
            err.stack : err;
    }).then((response) => {
        if (response.status === 'SUCCESS') {
            logger.info('Successfully sent transaction to the orderer.');
            return 'Chaincode Instantiateion is SUCCESS';
        } else {
            logger.error('Failed to order the transaction. Error code: ' + response.status);
            return 'Failed to order the transaction. Error code: ' + response.status;
        }
    }, (err) => {
        logger.error('Failed to send instantiate due to error: ' + err.stack ? err
            .stack : err);
        return 'Failed to send instantiate due to error: ' + err.stack ? err.stack :
            err;
    });
};

var queryChaincode = function (peer, channelName, chaincodeName, args, fcn, username, org) {
    var channel = helper.getChannelForOrg(org);
    var client = helper.getClientForOrg(org);
    var target = helper.buildTarget(peer, org);
    return helper.getRegisteredUsers(username, org).then((user) => {
        tx_id = client.newTransactionID();
        // send query
        var request = {
            chaincodeId: chaincodeName,
            txId: tx_id,
            fcn: fcn,
            args: args
        };
        return channel.queryByChaincode(request, target);
    }, (err) => {
        logger.info('Failed to get submitter \'' + username + '\'');
        return 'Failed to get submitter \'' + username + '\'. Error: ' + err.stack ? err.stack :
            err;
    }).then((response_payloads) => {
        if (response_payloads) {
            for (let i = 0; i < response_payloads.length; i++) {
                logger.info(args[0] + ' now has ' + response_payloads[i].toString('utf8') +
                    ' after the move');
                return args[0] + ' now has ' + response_payloads[i].toString('utf8') +
                    ' after the move';
            }
        } else {
            logger.error('response_payloads is null');
            return 'response_payloads is null';
        }
    }, (err) => {
        logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
            err);
        return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
    }).catch((err) => {
        logger.error('Failed to end to end test with error:' + err.stack ? err.stack :
            err);
        return 'Failed to end to end test with error:' + err.stack ? err.stack :
            err;
    });
};

var invokeChaincode = function(peersUrls, channelName, chaincodeName, fcn, args, username, org) {
	logger.debug(util.format('\n============ invoke transaction on organization %s ============\n', org));
	var client = helper.getClientForOrg(org);
	var channel = helper.getChannelForOrg(org);
	var targets = helper.newPeers(peersUrls);
	var tx_id = null;

	return helper.getRegisteredUsers(username, org).then((user) => {
		tx_id = client.newTransactionID();
		logger.debug(util.format('Sending transaction "%j"', tx_id));
		// send proposal to endorser
		var request = {
			targets: targets,
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: args,
			chainId: channelName,
			txId: tx_id
		};
		return channel.sendTransactionProposal(request);
	}, (err) => {
		logger.error('Failed to enroll user \'' + username + '\'. ' + err);
		throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
	}).then((results) => {
		var proposalResponses = results[0];
		var proposal = results[1];
		var all_good = true;
		for (var i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[0].response &&
				proposalResponses[0].response.status === 200) {
				one_good = true;
				logger.info('transaction proposal was good');
			} else {
				logger.error('transaction proposal was bad');
			}
			all_good = all_good & one_good;
		}
		if (all_good) {
			logger.debug(util.format(
				'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
				proposalResponses[0].response.status, proposalResponses[0].response.message,
				proposalResponses[0].response.payload, proposalResponses[0].endorsement
				.signature));
			var request = {
				proposalResponses: proposalResponses,
				proposal: proposal
			};
			// set the transaction listener and set a timeout of 30sec
			// if the transaction did not get committed within the timeout period,
			// fail the test
			var transactionID = tx_id.getTransactionID();
			var eventPromises = [];

			var eventhubs = helper.newEventHubs(peersUrls, org);
			for (let key in eventhubs) {
				let eh = eventhubs[key];
				eh.connect();

				let txPromise = new Promise((resolve, reject) => {
					let handle = setTimeout(() => {
						eh.disconnect();
						reject();
					}, 30000);

					eh.registerTxEvent(transactionID, (tx, code) => {
						clearTimeout(handle);
						eh.unregisterTxEvent(transactionID);
						eh.disconnect();

						if (code !== 'VALID') {
							logger.error(
								'The balance transfer transaction was invalid, code = ' + code);
							reject();
						} else {
							logger.info(
								'The balance transfer transaction has been committed on peer ' +
								eh._ep._endpoint.addr);
							resolve();
						}
					});
				});
				eventPromises.push(txPromise);
			};
			var sendPromise = channel.sendTransaction(request);
			return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
				logger.debug(' event promise all complete and testing complete');
				return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
			}).catch((err) => {
				logger.error(
					'Failed to send transaction and get notifications within the timeout period.'
				);
				return 'Failed to send transaction and get notifications within the timeout period.';
			});
		} else {
			logger.error(
				'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
			);
			return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
		}
	}, (err) => {
		logger.error('Failed to send proposal due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send proposal due to error: ' + err.stack ? err.stack :
			err;
	}).then((response) => {
		if (response.status === 'SUCCESS') {
			logger.info('Successfully sent transaction to the orderer.');
			return tx_id.getTransactionID();
		} else {
			logger.error('Failed to order the transaction. Error code: ' + response.status);
			return 'Failed to order the transaction. Error code: ' + response.status;
		}
	}, (err) => {
		logger.error('Failed to send transaction due to error: ' + err.stack ? err
			.stack : err);
		return 'Failed to send transaction due to error: ' + err.stack ? err.stack :
			err;
	});
};

//getInstalledChaincodes
var getInstalledChaincodes = function(peer, type, username, org) {
	var target = helper.buildTarget(peer, org);
	var channel = helper.getChannelForOrg(org);
	var client = helper.getClientForOrg(org);

	return helper.getOrgAdmin(org).then((member) => {
		if (type === 'installed') {
			return client.queryInstalledChaincodes(target);
		} else {
			return channel.queryInstantiatedChaincodes(target);
		}
	}, (err) => {
		logger.info('Failed to get submitter "' + username + '"');
		return 'Failed to get submitter "' + username + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response) => {
		if (response) {
			if (type === 'installed') {
				logger.debug('<<< Installed Chaincodes >>>');
			} else {
				logger.debug('<<< Instantiated Chaincodes >>>');
			}
			var details = [];
			for (let i = 0; i < response.chaincodes.length; i++) {
				logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
				details.push('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
			}
			return details;
		} else {
			logger.error('response is null');
			return 'response is null';
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
    installChaincode: installChaincode,
    instantiateChaincode: instantiateChaincode,
    queryChaincode: queryChaincode,
    invokeChaincode: invokeChaincode,
	getInstalledChaincodes:getInstalledChaincodes
}