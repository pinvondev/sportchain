#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# This script is designed to be run in the org3cli container as the
# second step of the EYFN tutorial. It joins the org3 peers to the
# channel previously setup in the BYFN tutorial and install the
# chaincode as version 2.0 on peer0.org3.
#

echo
echo "========= Getting Org${ORGID} on to your first network ========= "
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
TIMEOUT="$4"
ORGID="$5"
: ${CHANNEL_NAME:="mychannel"}
: ${DELAY:="3"}
: ${LANGUAGE:="golang"}
: ${TIMEOUT:="10"}
LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
COUNTER=1
MAX_RETRY=5
ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

CC_SRC_PATH="github.com/chaincode/fabcar/go/"
if [ "$LANGUAGE" = "node" ]; then
	CC_SRC_PATH="/opt/gopath/src/github.com/chaincode/fabcar/node/"
fi

# import utils
. scripts/utils.sh

# 要获取最新的配置区块, 而不是第 0 个
# 但是区块中包含配置区块和非配置区块, 在上次提交配置时, 就应该记录配置区块的位置
echo "Fetching channel config block from orderer..."
set -x
peer channel fetch 0 $CHANNEL_NAME.block -o orderer.example.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA >&log.txt
res=$?
set +x
cat log.txt
verifyResult $res "Fetching config block from orderer has Failed"

echo "===================== Having peer0.org${ORGID} join the channel ===================== "
joinChannelWithRetry 0 ${ORGID}
echo "===================== peer0.org${ORGID} joined the channel \"$CHANNEL_NAME\" ===================== "
#echo "===================== Having peer1.org${ORGID} join the channel ===================== "
#joinChannelWithRetry 1 3
#echo "===================== peer1.org${ORGID} joined the channel \"$CHANNEL_NAME\" ===================== "
echo "Installing chaincode ${ORGID} on peer0.org${ORGID}..."
#installChaincode 0 ${ORGID} 2.0
installChaincode 0 ${ORGID} ${ORGID}

echo
echo "========= Got Org${ORGID} halfway onto your first network ========= "
echo

exit 0
