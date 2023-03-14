import { DeployFunction } from "hardhat-deploy/types";

const deployOrderApprover: DeployFunction = async ({
  ethers,
  getNamedAccounts,
  deployments,
}) => {
  const { deploy, getNetworkName } = deployments;
  const [signer] = await ethers.getSigners();
  const deployer = ethers.provider.getSigner(signer.address);
  let GPv2SigningAddress = "0x9008D19f58AAbD9eD0D60971565AA8510560ab41";

  if (getNetworkName() === "hardhat") {
    console.log("deploying GPv2Signing to hardhat");
    const GPv2Signing = await ethers.getContractFactory("GPv2Signing");
    const GPv2SigningContract = await GPv2Signing.deploy(GPv2SigningAddress);
    await GPv2SigningContract.deployed();
    GPv2SigningAddress = GPv2SigningContract.address;
  }

  const OrderApprover = await ethers.getContractFactory("CowswapOrderApprover");
  const orderApproverContract = await OrderApprover.deploy(GPv2SigningAddress);
  await orderApproverContract.deployed();

  console.log("OrderApprover address:", orderApproverContract.address);
};

export default deployOrderApprover;
