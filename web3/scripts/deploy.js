const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function init() {
  const address = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

  await helpers.setBalance(address, 1000 * 1e18);
}

init()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });