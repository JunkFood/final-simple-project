package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type Clothes struct {
	Cid    string `json:"cid"`
	Cstate string `json:"cstate"`
	Cissue string `json:"cissue"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()

	if function == "addDonate" {
		return s.addDonate(APIstub, args)
	} else if function == "changeState" {
		return s.changeState(APIstub, args)
	} else if function == "readDonate" {
		return s.readDonate(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) addDonate(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	// cid, cissue
	if len(args) != 2 {
		return shim.Error("fail!")
	}

	var user = Clothes{Cid: args[0], Cstate: "신청", Cissue: args[1]}
	userAsBytes, _ := json.Marshal(user)
	APIstub.PutState(args[0], userAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) changeState(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}
	// getState User
	userAsBytes, err := APIstub.GetState(args[0])
	if err != nil {
		jsonResp := "\"Error\":\"Failed to get state for " + args[0] + "\"}"
		return shim.Error(jsonResp)
	} else if userAsBytes == nil { // no State! error
		jsonResp := "\"Error\":\"User does not exist: " + args[0] + "\"}"
		return shim.Error(jsonResp)
	}
	// state ok
	cloth := Clothes{}
	err = json.Unmarshal(userAsBytes, &cloth)
	if err != nil {
		return shim.Error(err.Error())
	}

	cloth.Cstate = args[1]

	// update to User World state
	userAsBytes, err = json.Marshal(cloth)

	APIstub.PutState(args[0], userAsBytes)

	return shim.Success([]byte("rating is updated"))
}

func (s *SmartContract) readDonate(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	UserAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(UserAsBytes)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
