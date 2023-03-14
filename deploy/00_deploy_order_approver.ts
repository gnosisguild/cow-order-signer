import { DeployFunction } from "hardhat-deploy/types";

const deployOrderApprover: DeployFunction = async ({
  ethers,
  getNamedAccounts,
  deployments,
}) => {
  const { deploy } = deployments;

  const [signer] = await ethers.getSigners();
  const deployer = ethers.provider.getSigner(signer.address);

  const OrderApprover = await ethers.getContractFactory("OrderApprover");
  const orderApproverContract = await OrderApprover.deploy();
  await orderApproverContract.deployed();

  console.log("OrderApprover address:", orderApproverContract.address);
};

export default deployOrderApprover;
