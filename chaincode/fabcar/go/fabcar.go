package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type SportEnergy struct {
	Step      string `json:"step"`
	Owner     string `json:"owner"`
	Energy    string `json:"energy"`
	Timestamp string `json:"timestamp"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	sportEnergy := SportEnergy{Step: "0", Owner: "admin", Energy: "5000000000", Timestamp: timestamp}
	sportEnergyAsBytes, err := json.Marshal(sportEnergy)
	if err != nil {
		shim.Error(err.Error())
	}
	APIstub.PutState("admin", sportEnergyAsBytes)
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
	} else if function == "setEnergy" {
		return s.setEnergy(APIstub, args)
	} else if function == "getHistory" {
		return s.getHistory(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name.")
}

// 获取用户的历史交易
// 参数: 用户名
func (s *SmartContract) getHistory(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	fmt.Println("进入 gethisgory")
	if len(args) != 1 {
		return shim.Error("需要1个参数")
	}

	err := sanitizeArguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	type AuditHistory struct {
		TxId  string      `json:"txId"`
		Value SportEnergy `json:"value"`
	}
	var history []AuditHistory
	var sportEnergy SportEnergy

	resultsIterator, err := APIstub.GetHistoryForKey(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		historyData, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		var tx AuditHistory
		tx.TxId = historyData.TxId
		json.Unmarshal(historyData.Value, &sportEnergy)
		if historyData.Value == nil {
			var emptySportEnergy SportEnergy
			tx.Value = emptySportEnergy
		} else {
			json.Unmarshal(historyData.Value, &sportEnergy)
			tx.Value = sportEnergy
		}
		history = append(history, tx)
	}
	fmt.Println(history, "pinvon")
	historyAsBytes, _ := json.Marshal(history)
	return shim.Success(historyAsBytes)
}

// 用户上传步数 兑换运动能量
// 参数: 用户名, 步数, 能量
func (s *SmartContract) setEnergy(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error("需要3个参数")
	}
	err := sanitizeArguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}
	sportEnergy := SportEnergy{}
	sportEnergyAsBytes, err := APIstub.GetState(args[0]) // 根据用户名取得最新状态
	if err != nil {                                      // 还没有存储过这个用户的状态
		// step 与 energy 应为 int, 有时间再改
		sportEnergy.Step = "0"
		sportEnergy.Owner = args[0]
		sportEnergy.Energy = "0"
		sportEnergy.Timestamp = time.Now().Format("2006-01-02 15:04:05")
	} else { // 解析成SportEnergy对象, 并放入sportEnergy
		json.Unmarshal(sportEnergyAsBytes, &sportEnergy)
	}

	step, _ := strconv.Atoi(sportEnergy.Step)     // 将步数转成数字, 放入step
	energy, _ := strconv.Atoi(sportEnergy.Energy) // 将能量转成数字, 放入energy
	stepArg, _ := strconv.Atoi(args[1])           // 将第2个参数转成数字
	energyArg, _ := strconv.Atoi(args[2])
	step = step + stepArg
	energy = energy + energyArg

	sportEnergy.Step = strconv.Itoa(step)
	sportEnergy.Energy = strconv.Itoa(energy)
	sportEnergy.Timestamp = time.Now().Format("2006-01-02 15:04:05")

	sportEnergyAsBytes, _ = json.Marshal(sportEnergy) // 将sportEnergy序列化成JSON格式
	APIstub.PutState(args[0], sportEnergyAsBytes)     // 将JSON格式的sportEnergy写入状态数据库
	return shim.Success(nil)
}

// 暂定: 根据用户名查找
func (s *SmartContract) querySportEnergy(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	sportEnergyAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(sportEnergyAsBytes)
}

// 暂定: 用户名为键存储  该方法已弃用
func (s *SmartContract) createSportEnergy(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	pinvon := shim.NewLogger("pinvon")
	pinvon.Debug("pinvon debug")
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	err := sanitizeArguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	timestamp := time.Now().Format("2006-01-02 15:04:05")

	var sportEnergy = SportEnergy{Step: args[0], Owner: args[1], Energy: args[2], Timestamp: timestamp}

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

	timestamp := time.Now().Format("2006-01-02 15:04:05")

	var user11 = SportEnergy{Step: user1.Step, Owner: name1, Energy: A, Timestamp: timestamp}
	var user22 = SportEnergy{Step: user2.Step, Owner: name2, Energy: B, Timestamp: timestamp}

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
