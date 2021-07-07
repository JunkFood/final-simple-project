#!/bin/bash

if [ $# -ne 2 ]; then
	echo "Arguments are missing. ex) ./cc.sh instantiate 1.0.0"
	exit 1
fi

instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n newcloth -v $version -p github.com/newcloth
#chaincode instatiate
docker exec cli peer chaincode $instruction -n newcloth -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member")'
sleep 5
#chaincode invoke user1
docker exec cli peer chaincode invoke -n newcloth -C mychannel -c '{"Args":["addDonate","user1", "test"]}'
sleep 5
#chaincode query user1
docker exec cli peer chaincode query -n newcloth -C mychannel -c '{"Args":["readDonate","user1"]}'

#chaincode invoke add rating
docker exec cli peer chaincode invoke -n newcloth -C mychannel -c '{"Args":["changeState","user1","수거신청"]}'
sleep 5

echo '-------------------------------------END-------------------------------------'
