#!/bin/bash

echo "$#"
if [ "$#" -ne 3 ]; then
    echo "参数错误"
    exit 1
fi

ID="$1"
CHANNEL_NAME="$2"
TOTAL="$3"

#mkdir org${ID}
cd org${ID}

function create_docker_compose_file () {
    cp ../new_org_crypto_material/docker-compose-org.yml ./docker-compose-org${ID}.yml
    sed -i "s/org3/org${ID}/g" docker-compose-org${ID}.yml
    sed -i "s/Org3/Org${ID}/g" docker-compose-org${ID}.yml
}
create_docker_compose_file
exit

# 生成 crypto_config.yaml 文件
function create_crypto_config_file () {
    cp ../new_org_crypto_material/org3-crypto-template.yaml ./org${ID}-crypto.yaml
    sed -i "s/org3/org${ID}/g" org${ID}-crypto.yaml
    sed -i "s/Org3/Org${ID}/g" org${ID}-crypto.yaml
}
create_crypto_config_file


# 生成 configtx.yaml 文件
function create_configtx_file () {
    cp ../new_org_crypto_material/configtx-template.yaml ./configtx.yaml
    sed -i "s/Org3/Org${ID}/g" configtx.yaml
    sed -i "s/org3/org${ID}/g" configtx.yaml
}
create_configtx_file


../bin/cryptogen generate --config=./org${ID}-crypto.yaml
export FABRIC_CFG_PATH=$PWD
../bin/configtxgen -printOrg Org${ID}MSP > ../basic-network/config/org${ID}.json
cp -r ../basic-network/crypto-config/ordererOrganizations ./crypto-config/

# 安装与 jq 交互的工具
output_0=`docker exec cli apt update`
output_1=`docker exec cli apt install -y jq`

# 获取最新的配置区块
docker exec -e "ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -e "CHANNEL_NAME=${CHANNEL_NAME}" cli peer channel fetch config config_block.pb -o orderer.example.com:7050 -c ${CHANNEL_NAME}

# 过滤无关信息
docker exec cli configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config > config.json

# 将新增加的 Org 的配置信息添加到 config.json
docker exec cli jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"Org3MSP":.[1]}}}}}' config.json ./channel-artifacts/org${ID}.json > modified_config.json

# 将 config.json 和 modified_config 转回 config.pb 和 modified_config.pb
docker exec cli configtxlator proto_encode --input config.json --type common.Config --output config.pb
docker exec cli configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb

# 计算两个文件的增量
docker exec cli configtxlator compute_update --channel_id $CHANNEL_NAME --original config.pb --updated modified_config.pb --output org${ID}_update.pb

# 将 org2_update.pb 转成 json
docker exec cli configtxlator proto_decode --input org${ID}_update.pb --type common.ConfigUpdate | jq . > org${ID}_update.json

# 将之前过滤掉的与内容无关的数据添加回去
docker exec cli echo '{"payload":{"header":{"channel_header":{"channel_id":"${CHANNEL_NAME}", "type":2}},"data":{"config_update":'$(cat org${ID}_update.json)'}}}' | jq . > org${ID}_update_in_envelope.json

# 添加完成后转回 .pb 格式
docker exec cli configtxlator proto_encode --input org${ID}_update_in_envelope.json --type common.Envelope --output org2_update_in_envelope.pb

# Org1 对 .pb 文件签名
docker exec cli peer channel signconfigtx -f org${ID}_update_in_envelope.pb

# 剩下的 Org 对 .pb 文件签名

# 提交更新
docker exec cli peer channel update -f org3_update_in_envelope.pb -c $CHANNEL_NAME -o orderer.example.com:7050



# 启动新节点

docker exec -e "ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -e "CHANNEL_NAME=${CHANNEL_NAME}" Org${ID}cli peer channel fetch 0 mychannel.block -o orderer.example.com:7050 -c $CHANNEL_NAME
