const { utils } = require("ethers");
const { FindingType, FindingSeverity, Finding } = require("forta-agent");
const { createAddress, TestTransactionEvent } = require("forta-agent-tools/lib/tests.utils");
const { handleTransaction } = require("./agent");
const { CONTRACT_ADDRESS, EVENT_SIGNATURE, VALUE_WHALE } = require("./constants");

describe("Solace whale watcher agent", () => {
  describe("handleTransaction(txEvent)", () => {
    it("returns empty findings if the contract is not a match", async () => {
      const mockValue = VALUE_WHALE.add(1);

      const txEvent = new TestTransactionEvent()
        .setFrom(createAddress("0x1"))
        .setTo(createAddress("0x2a"))
        .setGasUsed(500)
        .addEventLog(
          EVENT_SIGNATURE,
          createAddress("0x2a"), //This is not solace contract address 
          utils.hexZeroPad(mockValue.toHexString(), 32),
          utils.hexZeroPad(createAddress("0x5"), 32),
          utils.hexZeroPad(createAddress("0x6"), 32),
          utils.hexZeroPad(mockValue.toHexString(), 32)
        );

        const findings = await handleTransaction(txEvent);
        expect(findings).toStrictEqual([]);  
    });

    it("returns empty findings if the event is not a match", async () => {
      const mockValue = VALUE_WHALE.add(1);

      const txEvent = new TestTransactionEvent()
        .setFrom(createAddress("0x1"))
        .setTo(createAddress(CONTRACT_ADDRESS))
        .setGasUsed(500)
        .addEventLog(
          "Approval(address,address,uint256)",//This is not the tranfer event signature
          createAddress(CONTRACT_ADDRESS),
          utils.hexZeroPad(mockValue.toHexString(), 32),
          utils.hexZeroPad(createAddress("0x5"), 32),
          utils.hexZeroPad(createAddress("0x6"), 32),
          utils.hexZeroPad(mockValue.toHexString(), 32)
        );
  
        const findings = await handleTransaction(txEvent);
        expect(findings).toStrictEqual([]);
      });

    it("returns empty findings if the value is less than whale value", async () => {
      const mockValue = VALUE_WHALE.sub(1);// This is less than whale value of 1 million
      
      const txEvent = new TestTransactionEvent()
        .setFrom(createAddress("0x1"))
        .setTo(createAddress(CONTRACT_ADDRESS))
        .setGasUsed(500)
        .addEventLog(
          EVENT_SIGNATURE,
          createAddress(CONTRACT_ADDRESS),
          utils.hexZeroPad(mockValue.toHexString(), 32),
          utils.hexZeroPad(createAddress("0x5"), 32),
          utils.hexZeroPad(createAddress("0x6"), 32),
          utils.hexZeroPad(mockValue.toHexString(), 32)
        );

      const findings = await handleTransaction(txEvent);
      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if the value is at least whale value", async () => {
      const mockValue = VALUE_WHALE.add(1);
      const ethValue = utils.formatEther(mockValue);
      const ethValueFormatted = utils.commify(ethValue);

      const txEvent = new TestTransactionEvent()
        .setFrom(createAddress("0x1"))
        .setTo(createAddress(CONTRACT_ADDRESS))
        .setGasUsed(500)
        .addEventLog(
          EVENT_SIGNATURE,
          createAddress(CONTRACT_ADDRESS),
          utils.hexZeroPad(mockValue.toHexString(), 32),
          utils.hexZeroPad(createAddress("0x5"), 32),
          utils.hexZeroPad(createAddress("0x6"), 32),
          utils.hexZeroPad(mockValue.toHexString(), 32)
        );
        
      const findings = await handleTransaction(txEvent);

      // console.log(findings);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Solace Whale Transfer",
          description: `Whale Transfer Value: ${ethValueFormatted} solace`,
          alertId: "AS-SOLACE-WHALE",
          severity: FindingSeverity.Medium,
          type: FindingType.Suspicious,
          metadata: {
            from: utils.hexZeroPad(createAddress("0x5"), 20),
            to: utils.hexZeroPad(createAddress("0x6"), 20),
            value: mockValue.toString()
          }
        }),
      ]);
    });
  });
});
