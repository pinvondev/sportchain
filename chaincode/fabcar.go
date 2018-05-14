package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type SportEnergy struct {
	Step   string `json:"step"`
	Owner  string `json:"owner"`
	Energy string `json:"energy"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	if function == "querySportEnergy" {
		return s.querySportEnergy(APIstub, args)
	} else if function == "createSportEnergy" {
		return s.createSportEnergy(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

// 暂定: 根据用户名查找
func (s *SmartContract) querySportEnergy(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	sportEnergyAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(sportEnergyAsBytes)
}

// 暂定: 用户名为键存储
func (s *SmartContract) createSportEnergy(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	var sportEnergy = SportEnergy{Step: args[0], Owner: args[1], Energy: args[2]}

	sportEnergyAsBytes, _ := json.Marshal(sportEnergy)
	APIstub.PutState(args[1], sportEnergyAsBytes)

	return shim.Success(nil)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
