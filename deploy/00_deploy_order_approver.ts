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

  const OrderSigner = await ethers.getContractFactory("CowswapOrderSigner");
  const orderSignerContract = await OrderSigner.deploy(GPv2SigningAddress);
  await orderSignerContract.deployed();

  console.log("OrderApprover address:", orderSignerContract.address);
};

export default deployOrderApprover;
