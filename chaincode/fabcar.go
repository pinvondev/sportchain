package main

import (
	"encoding/json"
	"fmt"
	"strconv"
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
	} else if function == "deal" {
		return s.deal(APIstub, args)
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
	pinvon := shim.NewLogger("pinvon")
	pinvon.Debug("pinvon debug")
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	var sportEnergy = SportEnergy{Step:args[0], Owner: args[1], Energy: args[2]}

	sportEnergyAsBytes, _ := json.Marshal(sportEnergy)
	APIstub.PutState(args[1], sportEnergyAsBytes)

	return shim.Success(nil)
}

// yong hu jiao 
func (s *SmartContract) deal(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	fmt.Printf("enter function deal!")
	var name1 string
	var name2 string
	var Aval, Bval int
	var X int
	var err error
//	var step1, step2 string
	var user1 SportEnergy
	var user2 SportEnergy
	var A, B string

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	name1 = args[0]
	name2 = args[1]

	Avalbytes, err := APIstub.GetState(name1)
	 if err != nil {
                return shim.Error("Failed to get state")
        }
        if Avalbytes == nil {
                return shim.Error("Entity not found")
        }
//	Aval, _ = strconv.Atoi(string(Avalbytes))
//	var user1 = SportEnergy{}
	json.Unmarshal(Avalbytes, &user1)
//	step1 = user1.Step
	Aval, _ = strconv.Atoi(string(user1.Energy))

	Bvalbytes, err := APIstub.GetState(name2)
	if err != nil {
                return shim.Error("Failed to get state")
        }
        if Bvalbytes == nil {
                return shim.Error("Entity not found")
        }
//	 Bval, _ = strconv.Atoi(string(Bvalbytes))
//	user2 := SportEnergy{}
	json.Unmarshal(Bvalbytes, &user2)
//	step2 = user2.Step
	Bval, _ = strconv.Atoi(string(user2.Energy))

	X, err = strconv.Atoi(args[2])
        if err != nil {
                return shim.Error("Invalid transaction amount, expecting a integer value")
        }
        Aval = Aval - X
        Bval = Bval + X
        fmt.Printf("Aval = %d, Bval = %d\n", Aval, Bval)
	A = strconv.Itoa(Aval)
	B = strconv.Itoa(Bval)

	var user11 = SportEnergy{Step: user1.Step, Owner: name1, Energy:A }
	var user22 = SportEnergy{Step: user2.Step, Owner: name2, Energy:B }

	AJSONasBytes, err := json.Marshal(user11)
        if err != nil {
                return shim.Error(err.Error())
        }
	BJSONasBytes, err := json.Marshal(user22)
        if err != nil {
                return shim.Error(err.Error())
        }


	err = APIstub.PutState(name1, AJSONasBytes)
        if err != nil {
                return shim.Error(err.Error())
        }

        err = APIstub.PutState(name2, BJSONasBytes)
        if err != nil {
                return shim.Error(err.Error())
        }


        return shim.Success(nil)
}


func main() {
	// shim.SetLoggingLevel(shim.LogDebug)
	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	fmt.Printf("start create a new smart contract")
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
