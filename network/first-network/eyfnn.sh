#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This script extends the Hyperledger Fabric By Your First Network by
# adding a third organization to the network previously setup in the
# BYFN tutorial.
#

# prepending $PWD/../bin to PATH to ensure we are picking up the correct binaries
# this may be commented out to resolve installed version of tools if desired
export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}

# Print the usage message
function printHelp () {
  echo "Usage: "
  echo "  eyfn.sh up|down|restart|generate [-c <channel name>] [-t <timeout>] [-d <delay>] [-f <docker-compose-file>] [-s <dbtype>]"
  echo "  eyfn.sh -h|--help (print this message)"
  echo "    <mode> - one of 'up', 'down', 'restart' or 'generate'"
  echo "      - 'up' - bring up the network with docker-compose up"
  echo "      - 'down' - clear the network with docker-compose down"
  echo "      - 'restart' - restart the network"
  echo "      - 'generate' - generate required certificates and genesis block"
  echo "    -c <channel name> - channel name to use (defaults to \"mychannel\")"
  echo "    -t <timeout> - CLI timeout duration in seconds (defaults to 10)"
  echo "    -d <delay> - delay duration in seconds (defaults to 3)"
  echo "    -f <docker-compose-file> - specify which docker-compose file use (defaults to docker-compose-cli.yaml)"
  echo "    -s <dbtype> - the database backend to use: goleveldb (default) or couchdb"
  echo "    -l <language> - the chaincode language: golang (default) or node"
  echo "    -i <imagetag> - the tag to be used to launch the network (defaults to \"latest\")"
  echo "    -n <org id> - the id of org to join the network"
  echo "    -a <total org> - the total number of orgs have joined the network"
  echo
  echo "Typically, one would first generate the required certificates and "
  echo "genesis block, then bring up the network. e.g.:"
  echo
  echo "	eyfn.sh generate -c mychannel"
  echo "	eyfn.sh up -c mychannel -s couchdb"
  echo "	eyfn.sh up -l node"
  echo "	eyfn.sh down -c mychannel"
  echo
  echo "Taking all defaults:"
  echo "	eyfn.sh generate"
  echo "	eyfn.sh up"
  echo "	eyfn.sh down"
}

# Ask user for confirmation to proceed
function askProceed () {
  read -p "Continue? [Y/n] " ans
  case "$ans" in
    y|Y|"" )
      echo "proceeding ..."
    ;;
    n|N )
      echo "exiting..."
      exit 1
    ;;
    * )
      echo "invalid response"
      askProceed
    ;;
  esac
}

# Obtain CONTAINER_IDS and remove them
# TODO Might want to make this optional - could clear other containers
function clearContainers () {
  CONTAINER_IDS=$(docker ps -aq)
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    echo "---- No containers available for deletion ----"
  else
    docker rm -f $CONTAINER_IDS
  fi
}

# Delete any images that were generated as a part of this setup
# specifically the following images are often left behind:
# TODO list generated image naming patterns
function removeUnwantedImages() {
  DOCKER_IMAGE_IDS=$(docker images | grep "dev\|none\|test-vp\|peer[0-9]-" | awk '{print $3}')
  if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
    echo "---- No images available for deletion ----"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

# Generate the needed certificates, the genesis block and start the network.
function networkUp () {
  # generate artifacts if they don't exist
  if [ ! -d "orgn-artifacts/crypto-config" ]; then
    generateCerts
    generateChannelArtifacts
    createConfigTx
  fi
  # start org${ORGID} peers
  cp docker-compose-orgn.yaml docker-compose-org${ORGID}.yaml
  sed -i "s/rg3/rg${ORGID}/g" docker-compose-org${ORGID}.yaml
  my_port_1=`echo "11051 ${ORGID}"|awk '{printf("%d",$1+$2)}'`
  my_port_2=`echo "11053 ${ORGID}"|awk '{printf("%d",$1-$2)}'`
  sed -i "s/11051/${my_port_1}/g" docker-compose-org${ORGID}.yaml
  sed -i "s/11053/${my_port_2}/g" docker-compose-org${ORGID}.yaml
  if [ "${IF_COUCHDB}" == "couchdb" ]; then
      IMAGE_TAG=${IMAGETAG} docker-compose -f $COMPOSE_FILE_ORGN -f $COMPOSE_FILE_COUCH_ORG3 up -d 2>&1
  else
      echo "$IMAGETAG docker-compose -f $COMPOSE_FILE_ORGN up -d 2>&1"
      IMAGE_TAG=$IMAGETAG docker-compose -f $COMPOSE_FILE_ORGN up -d 2>&1
  fi
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to start Org${ORGID} network"
    exit 1
  fi
  echo
  echo "###############################################################"
  echo "############### Have Org${ORGID} peers join network ##################"
  echo "###############################################################"
  docker exec Org${ORGID}cli ./scripts/step2org3.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $ORGID
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to have Org${ORGID} peers join network"
    exit 1
  fi
  echo
  echo "###############################################################"
  echo "##### Upgrade chaincode to have Org${ORGID} peers on the network #####"
  echo "###############################################################"
  docker exec cli ./scripts/step3org3.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $ORGID
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to add Org${ORGID} peers on network"
    exit 1
  fi
  # finish by running the test
#  docker exec Org${ORGID}cli ./scripts/testorg3.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $ORGID
#  if [ $? -ne 0 ]; then
#    echo "ERROR !!!! Unable to run test"
#    exit 1
#  fi
}

# Tear down running network
function networkDown () {
  docker-compose -f $COMPOSE_FILE -f $COMPOSE_FILE_ORGN down --volumes
  docker-compose -f $COMPOSE_FILE -f $COMPOSE_FILE_ORGN -f $COMPOSE_FILE_COUCH down --volumes
  # Don't remove containers, images, etc if restarting
  if [ "$MODE" != "restart" ]; then
    #Cleanup the chaincode containers
    clearContainers
    #Cleanup images
    removeUnwantedImages
    # remove orderer block and other channel configuration transactions and certs
    rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config ./org3-artifacts/crypto-config/ channel-artifacts/org3.json
    # remove the docker-compose yaml file that was customized to the example
    rm -f docker-compose-e2e.yaml
  fi

  # For some black-magic reason the first docker-compose down does not actually cleanup the volumes
  docker-compose -f $COMPOSE_FILE -f $COMPOSE_FILE_ORGN down --volumes
  docker-compose -f $COMPOSE_FILE -f $COMPOSE_FILE_ORGN -f $COMPOSE_FILE_COUCH down --volumes
}

# Use the CLI container to create the configuration transaction needed to add
# Org3 to the network
function createConfigTx () {
  echo
  echo "###############################################################"
  echo "####### Generate and submit config tx to add Org${ORGID}$ #############"
  echo "###############################################################"
#  if [ $ORGID -le 3 ]; then
#      docker exec cli scripts/step1org3.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $ORGID
#  else
#      for((i=3; i<$ORGID; i++)); do
#          docker exec Org${i}cli scripts/step1org3.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $ORGID $i
#      done
#  fi
  docker exec cli scripts/step1org3.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $ORGID

  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to create config tx"
    exit 1
  fi
}

# We use the cryptogen tool to generate the cryptographic material
# (x509 certs) for the new org.  After we run the tool, the certs will
# be parked in the BYFN folder titled ``crypto-config``.

# Generates Org3 certs using cryptogen tool
function generateCerts (){
  which cryptogen
  if [ "$?" -ne 0 ]; then
    echo "cryptogen tool not found. exiting"
    exit 1
  fi

  echo
  echo "###############################################################"
  echo "##### Generate Org${ORGID} certificates using cryptogen tool #########"
  echo "###############################################################"
  cp orgn-artifacts/org-crypto-template.yaml org${ORGID}-artifacts/org${ORGID}-crypto.yaml
  sed -i "s/rg3/rg${ORGID}/g" org${ORGID}-artifacts/org${ORGID}-crypto.yaml
  (cd org${ORGID}-artifacts
   set -x
   cryptogen generate --config=./org${ORGID}-crypto.yaml
   res=$?
   set +x
   if [ $res -ne 0 ]; then
     echo "Failed to generate certificates..."
     exit 1
   fi
   cp -r ./crypto-config/peerOrganizations/org${ORGID}.example.com ../crypto-config/peerOrganizations
  )
  echo
}

# Generate channel configuration transaction
function generateChannelArtifacts() {
  which configtxgen
  if [ "$?" -ne 0 ]; then
    echo "configtxgen tool not found. exiting"
    exit 1
  fi
  echo "##########################################################"
  echo "#########  Generating Org${ORGID} config material ###############"
  echo "##########################################################"
  cp orgn-artifacts/configtx.yaml org${ORGID}-artifacts/configtx.yaml
  sed -i "s/rg3/rg${ORGID}/g" org${ORGID}-artifacts/configtx.yaml
  (cd org${ORGID}-artifacts
   export FABRIC_CFG_PATH=$PWD
   set -x
   configtxgen -printOrg Org${ORGID}MSP > ../channel-artifacts/org${ORGID}.json
   res=$?
   set +x
   if [ $res -ne 0 ]; then
     echo "Failed to generate Org${ORGID} config material..."
     exit 1
   fi
  )
  cp -r crypto-config/ordererOrganizations org${ORGID}-artifacts/crypto-config/
#  cp -r org${ORGID}-artifacts/crypto-config/
  echo
}


# If BYFN wasn't run abort
if [ ! -d crypto-config ]; then
  echo
  echo "ERROR: Please, run byfn.sh first."
  echo
  exit 1
fi

# Obtain the OS and Architecture string that will be used to select the correct
# native binaries for your platform
OS_ARCH=$(echo "$(uname -s|tr '[:upper:]' '[:lower:]'|sed 's/mingw64_nt.*/windows/')-$(uname -m | sed 's/x86_64/amd64/g')" | awk '{print tolower($0)}')
# timeout duration - the duration the CLI should wait for a response from
# another container before giving up
CLI_TIMEOUT=10
#default for delay
CLI_DELAY=3
# channel name defaults to "mychannel"
CHANNEL_NAME="mychannel"
# use this as the default docker-compose yaml definition
COMPOSE_FILE=docker-compose-cli.yaml
#
COMPOSE_FILE_COUCH=docker-compose-couch.yaml
# use this as the default docker-compose yaml definition
#
COMPOSE_FILE_COUCH_ORG3=docker-compose-couch-org3.yaml
# use golang as the default language for chaincode
LANGUAGE=golang
# default image tag
IMAGETAG="latest"
ORGID=0
TOTAL=0

# Parse commandline args
if [ "$1" = "-m" ];then	# supports old usage, muscle memory is powerful!
    shift
fi
MODE=$1;shift
# Determine whether starting, stopping, restarting or generating for announce
if [ "$MODE" == "up" ]; then
  EXPMODE="Starting"
elif [ "$MODE" == "down" ]; then
  EXPMODE="Stopping"
elif [ "$MODE" == "restart" ]; then
  EXPMODE="Restarting"
elif [ "$MODE" == "generate" ]; then
  EXPMODE="Generating certs and genesis block for"
else
  printHelp
  exit 1
fi
while getopts "h?c:t:d:f:s:l:i:n:a:" opt; do
  echo pinvon $opt $OPTARG
  case "$opt" in
    h|\?)
      printHelp
      exit 0
    ;;
    c)  CHANNEL_NAME=$OPTARG
    ;;
    t)  CLI_TIMEOUT=$OPTARG
    ;;
    d)  CLI_DELAY=$OPTARG
    ;;
    f)  COMPOSE_FILE=$OPTARG
    ;;
    s)  IF_COUCHDB=$OPTARG
    ;;
    l)  LANGUAGE=$OPTARG
    ;;
    i)  IMAGETAG=$OPTARG
    ;;
    n)  ORGID=$OPTARG
    ;;
    a)  TOTAL=$OPTARG
    ;;
  esac
done

if [ ${ORGID} -eq 0 ] || [ ${TOTAL} -eq 0 ]; then
    echo "请输入组织 ID 和已有组织数"
    exit 1
fi

if [ ${ORGID} -le ${TOTAL} ]; then
    echo "该组织之前已经加入网络"
    exit 1
fi

COMPOSE_FILE_ORGN=docker-compose-org${ORGID}.yaml

# Announce what was requested

  if [ "${IF_COUCHDB}" == "couchdb" ]; then
        echo
        echo "${EXPMODE} with channel '${CHANNEL_NAME}' and CLI timeout of '${CLI_TIMEOUT}' seconds and CLI delay of '${CLI_DELAY}' seconds and using database '${IF_COUCHDB}'"
  else
        echo "${EXPMODE} with channel '${CHANNEL_NAME}' and CLI timeout of '${CLI_TIMEOUT}' seconds and CLI delay of '${CLI_DELAY}' seconds"
  fi
# ask for confirmation to proceed
askProceed
mkdir org${ORGID}-artifacts

#Create the network using docker compose
if [ "${MODE}" == "up" ]; then
  networkUp
elif [ "${MODE}" == "down" ]; then ## Clear the network
  networkDown
elif [ "${MODE}" == "generate" ]; then ## Generate Artifacts
  generateCerts
  generateChannelArtifacts
  createConfigTx
elif [ "${MODE}" == "restart" ]; then ## Restart the network
  networkDown
  networkUp
else
  printHelp
  exit 1
fi
