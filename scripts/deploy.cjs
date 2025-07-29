const { ethers } = require("hardhat");

async function main() {
  const rewardsContract = await ethers.deployContract("MonatypeRewards");

  await rewardsContract.waitForDeployment();

  console.log(
    `Rewards contract deployed to ${rewardsContract.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
