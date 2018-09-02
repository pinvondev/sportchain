#!/bin/bash
ID="$1"
CHANNEL_NAME="$2"

set -x
./byfnn.sh -m generate -c $CHANNEL_NAME
set +x

# 创建 Channel
docker exec -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/peers/peer0.org${ID}.example.com/tls/ca.crt" -e "CORE_PEER_ADDRESS=peer0.org${ID}.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org${ID}MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/users/Admin@org${ID}.example.com/msp" cli peer channel create -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# 加入 Channel
docker exec -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/peers/peer0.org${ID}.example.com/tls/ca.crt" -e "CORE_PEER_ADDRESS=peer0.org${ID}.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org${ID}MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/users/Admin@org${ID}.example.com/msp" cli peer channel join -b ${CHANNEL_NAME}.block

set -x
docker exec -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/peers/peer0.org${ID}.example.com/tls/ca.crt" -e "CORE_PEER_ADDRESS=peer0.org${ID}.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org${ID}MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/users/Admin@org${ID}.example.com/msp" cli peer channel list
set +x

# 安装链码 链码的名称与位置需要再修改.
docker exec -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/peers/peer0.org${ID}.example.com/tls/ca.crt" -e "CORE_PEER_ADDRESS=peer0.org${ID}.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org${ID}MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/users/Admin@org${ID}.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p github.com/chaincode/fabcar/go

# 实例化链码
set -x
docker exec -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/peers/peer0.org${ID}.example.com/tls/ca.crt" -e "CORE_PEER_ADDRESS=peer0.org${ID}.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org${ID}MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/users/Admin@org${ID}.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n fabcar -v 1.0 -c '{"Args":[""]}' -P "OR ('Org${ID}MSP.member')"
set +x