const { ethers } = require("ethers");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { ABI, CONTRACT_ADDRESS, EVENT_NAME, EVENT_FROM_ARG_INDEX, EVENT_TO_ARG_INDEX, EVENT_VALUE_ARG_INDEX, VALUE_WHALE } = require("./constants");


const handleTransaction = async (txEvent) => {
  const findings = [];

  let iface = new ethers.utils.Interface(ABI);
  //Iterate over transaction logs
  txEvent.receipt.logs.forEach((log) => {

    //Match the contract address of solace with transaction log Address
    if (log.address.toString().toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
      // This is the contract we are monitoring

      try {
        const logParsed = iface.parseLog(log);

        if (logParsed?.eventFragment?.name === EVENT_NAME) {
          // This is the desired event on our contract

          const value = logParsed.args[EVENT_VALUE_ARG_INDEX];

          if (value.gte(VALUE_WHALE)) {
            // We have a whale of a transaction !
            const ethValue = ethers.utils.formatEther(value);
            const ethValueFormatted = ethers.utils.commify(ethValue);
            findings.push(
              Finding.fromObject({
                name: "Solace Whale Transfer",
                description: `Whale Transfer Value: ${ethValueFormatted} solace`,
                alertId: "AS-SOLACE-WHALE",
                severity: FindingSeverity.Medium,
                type: FindingType.Suspicious,
                metadata: {
                  from: logParsed.args[EVENT_FROM_ARG_INDEX].toString(),
                  to: logParsed.args[EVENT_TO_ARG_INDEX].toString(),
                  value: logParsed.args[EVENT_VALUE_ARG_INDEX].toString()
                }
              })
            );
          } else {
            // This is not a whale of a transaction
          }
        }
      } catch (err) {
        // This is strange, we should not have challenges parsing logs on our own ABI
        console.log("Unexpected Error:",err);
      }
    }
  });

  return findings;
};

// const handleBlock = async (blockEvent) => {
//   const findings = [];
//   // detect some block condition
//   return findings;
// };

module.exports = {
  handleTransaction,
  // handleBlock,
};
