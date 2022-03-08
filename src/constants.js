const { ethers } = require("ethers");

// The ABI for the Solace contact from https://etherscan.io/address/0x501ace9c35e60f03a2af4d484f49f9b1efde9f40#code
const { ABI } = require("./abi/SOLACE.json");

// The immutable address of the Solace smart contract
const CONTRACT_ADDRESS = "0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40";

// Detail on the event we wish to monitor when it is emitted
const EVENT_NAME = "Transfer";
const EVENT_SIGNATURE = "Transfer(address,address,uint256)";
const EVENT_FROM_ARG_INDEX = 0;
const EVENT_TO_ARG_INDEX = 1;
const EVENT_VALUE_ARG_INDEX = 2;

// Our definition of the a Whale of a transfer
const VALUE_WHALE = ethers.utils.parseUnits("1000000", 18);

module.exports = {
    ABI,
    CONTRACT_ADDRESS,
    EVENT_NAME,
    EVENT_SIGNATURE,
    EVENT_FROM_ARG_INDEX,
    EVENT_TO_ARG_INDEX,
    EVENT_VALUE_ARG_INDEX,
    VALUE_WHALE,
  };