#!/bin/bash
# 创建一个通道, 需要三个文件.
# docker-composer.yml: 容器的配置
# crypto-config.yaml: 节点的配置
# configtx.yaml: 通道的配置文件, 生成创世区块

# 所有商家所在的同一个联盟, 在平台启动时已经创建. 商家自己创建的联盟, 在后期根据需要创建, 此时, 容器已经启动, 所以不需要 docker-composer.yml 文件, 仅根据已有的容器来创建自己的联盟.

# 不同的商家, 分配不同的 ID, 在这边根据 ID 的不同, 来决定为哪些商家创建 channel
# 一般一个商家只有一个节点, 除非是大型商家, 有可能会多维护几个节点, 目前只考虑一个节点; 对于 Orderer 节点, 不管多少 channel, 都使用相同的 Orderer, 故 Orderer 部分不变; 因此, 目前只有一个代码商家的 ID 作为参数.

# 第一个参数 商家 ID
# 第二个参数 channel 名称
# ChainCode = ID_channel名称

ID=$1
CHANNEL_NAME=$2

echo $#
if [ $# -ne 2 ]; then
    echo "参数不正确"
    exit 1
fi

cd ./basic-network
function generateChannelArtifacts() {
  echo $#
  if [ "$#" -ne 1 ]; then
    echo "缺少参数"
    exit 1
  fi

  echo "##########################################################"
  echo "#########  Generating Orderer Genesis block ##############"
  echo "##########################################################"
  # Note: For some unknown reason (at least for now) the block file can't be
  # named orderer.genesis.block or the orderer will fail to launch!
  set -x
  ../bin/configtxgen -profile OneOrgOrdererGenesis -outputBlock ./config/genesis.block
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate orderer genesis block..."
    exit 1
  fi
  echo
  echo "#################################################################"
  echo "### Generating channel configuration transaction 'channel.tx' ###"
  echo "#################################################################"
  set -x
  ../bin/configtxgen -profile OneOrgChannel -outputCreateChannelTx ./config/channel.tx -channelID ${CHANNEL_NAME}
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate channel configuration transaction..."
    exit 1
  fi

  echo
  echo "#################################################################"
  echo "#######    Generating anchor peer update for Org${ID}MSP   ##########"
  echo "#################################################################"
  set -x
  ../bin/configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID ${CHANNEL_NAME} -asOrg Org${ID}MSP
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate anchor peer update for Org${ID}MSP..."
    exit 1
  fi
}

generateChannelArtifacts ${CHANNEL_NAME}

# 创建 Channel
docker exec -e "CORE_PEER_LOCALMSPID=Org${ID}MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org${ID}.example.com/msp" peer0.org${ID}.example.com peer channel create -o orderer.example.com:7050 -c ${CHANNEL_NAME} -f /etc/hyperledger/configtx/channel.tx

# 加入 Channel
docker exec -e "CORE_PEER_LOCALMSPID=Org${ID}MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org${ID}.example.com/msp" peer0.org${ID}.example.com peer channel join -b ${CHANNEL_NAME}.block

# 安装链码
docker exec -e "CORE_PEER_LOCALMSPID=Org${ID}MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/users/Admin@org${ID}.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"

# 实例化链码
docker exec -e "CORE_PEER_LOCALMSPID=Org${ID}MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${ID}.example.com/users/Admin@org${ID}.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C ${CHANNEL_NAME} -n fabcar -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org${ID}MSP.member','Org2MSP.member')"
