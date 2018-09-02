var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var logger = require('../utils/logger');

module.exports = {
    queryOrgs: function () {
        var fabric_client = new Fabric_Client();
        var channel = fabric_client.newChannel('mychannel');
        var peer = fabric_client.newPeer('grpc://localhost:7051');
        channel.addPeer(peer);
        var store_path = path.join(__dirname, 'hfc-key-store');
        Fabric_Client.newDefaultKeyValueStore({ path: store_path})
        .then((state_store) => {
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
            return fabric_client.getUserContext('admin', true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                logger.info('Successfully loaded admin from persistence');
                member_user = user_from_store;
            } else {
                throw new Error('Failed to get admin .... run registerUser.js');
            }
            return channel.getPeers();
        }).then((query_responses) => {
            logger.info("Query has completed, checking results");
            logger.debug(query_responses);
            logger.debug(query_responses.length);
        }).catch((err) => {
            logger.error('Failed to query successfully :: ' + err);
            //callback(err, null);
        });
    }, 
    queryByUsers: function (username, fcn, args, callback) {
        var channel = fabric_client.newChannel('mychannel');
        var peer = fabric_client.newPeer('grpc://localhost:7051');
        channel.addPeer(peer);
        var member_user = null;
        var store_path = path.join(__dirname, 'hfc-key-store');
        var tx_id = null;
        Fabric_Client.newDefaultKeyValueStore({ path: store_path
        }).then((state_store) => {
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
            return fabric_client.getUserContext(username, true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded ' + username + ' from persistence');
                member_user = user_from_store;
            } else {
                throw new Error('Failed to get ' + username + '.... run registerUser.js');
            }
            const request = {
                chaincodeId: 'fabcar',
                fcn: fcn,
                args: args
            };
            return channel.queryByChaincode(request);
        }).then((query_responses) => {
            console.log("Query has completed, checking results");
            if (query_responses && query_responses.length == 1) {
                if (query_responses[0] instanceof Error) {
                    console.error("error from query = ", query_responses[0]);
                } else {
                    console.log("Response is ", query_responses[0].toString());
                    callback(null, query_responses[0].toString());
                }
            } else {
                console.log("No payloads were returned from query");
            }
        }).catch((err) => {
            console.error('Failed to query successfully :: ' + err);
            callback(err, null);
        });
    },
    queryByBlockId: function (blockNumber, callback) {
        var channel = fabric_client.newChannel('mychannel');
        var peer = fabric_client.newPeer('grpc://localhost:7051');
        channel.addPeer(peer);
        var member_user = null;
        var store_path = path.join(__dirname, 'hfc-key-store');
        console.log('Store path:'+store_path);
        Fabric_Client.newDefaultKeyValueStore({ path: store_path
        }).then((state_store) => {
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
            return fabric_client.getUserContext('admin', true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded admin from persistence');
                member_user = user_from_store;
            } else {
                throw new Error('Failed to get admin .... run registerUser.js');
            }
            return channel.queryBlock(parseInt(blockNumber), peer, true);
        }).then((query_responses) => {
            console.log('pinvon', query_responses);
            console.log("Query has completed, checking results");
            if (query_responses) {
                if (query_responses) {
                    callback(query_responses, null);
                } else {
                    console.log("Response is ", query_responses.toString());
                    callback(null, query_responses.toString());
                }
            } else {
                console.log("No payloads were returned from query");
            }
        }).catch((err) => {
            console.error('Failed to query successfully :: ' + err);
            callback(err, null);
        });
    }
}
