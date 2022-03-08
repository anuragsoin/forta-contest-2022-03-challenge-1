# Forta Contest 2022-03 - Challenge 1: Solace Whale Agent

## Description

This agent detects Solace transfers of whale like proportions (>= 1,000,000)

## Configuration
```
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
```

## Supported Chains

- Ethereum (Mainnet)

## Alerts

This agent emits a single alert, namely:

- AS-SOLACE-WHALE
  - Fired when a Transfer event is emitted on the Solace contract with value >= 1M
  - Name is always set to "Solace Whale Transfer"
  - Description will note the value
  - Severity is always set to "medium"
  - Type is always set to "suspicious"
  - Metadata
    - from (sender) address
    - to (recipient) address
    - value (in decimal notation)


## Unit Test
Unit testing for this agent is powered by Jest, run the following command to execute the unit test.

```shell script
$ npm test
```

### Negative Test Cases
- Returns empty findings if the contract is not a match
- Returns empty findings if the event is not a match
- Returns empty findings if the value is less than whale value 

### Positive Test Case
- Returns a finding if the value is at least whale value

## Test Data
The agent behavior can be verified with the following transactions:

- Negative Test Case
  - 0x4d9e7fd3169c978d22fc0490924f5bbd5d48bb7194534cbdd5161038c72105bb
  - Value
    - wei: 32,058,112,054,759,146,829,968
    - ~eth: 32,058.11

- Positive Test Case
  - 0x846b93c09aff2416f53fcd79c2bcb3a052bb6b19b62be7352051294c0e5eed1a
  - Value
    - wei: 500,000,000,000,000,000,000,000,000
    - ~eth: 500,000,000

```shell script

# Negative Test Case
$ npm run tx 0x4d9e7fd3169c978d22fc0490924f5bbd5d48bb7194534cbdd5161038c72105bb

# Positive Test Case
$ npm run tx 0x846b93c09aff2416f53fcd79c2bcb3a052bb6b19b62be7352051294c0e5eed1a
```

## Bonus Content
Using GCP BigQuery, manged to find a nice whale transaction. The SQL used is:

```sql
SELECT * 
FROM `bigquery-public-data.crypto_ethereum.token_transfers` 
WHERE lower(token_address) = lower("0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40")
AND BYTE_LENGTH(value) >= 24
ORDER BY BYTE_LENGTH(value) desc, value desc
LIMIT 1000
```