import { defaultAbiCoder } from "@ethersproject/abi";
import { DeployFunction } from "hardhat-deploy/types";
import { deployMastercopyWithInitData } from "@gnosis.pm/zodiac";
import {
  formatEther,
  formatUnits,
  getCreate2Address,
  keccak256,
  parseUnits,
} from "ethers/lib/utils";
import { getSingletonFactory } from "@gnosis.pm/zodiac/dist/src/factory/singletonFactory";
import { BigNumber } from "ethers";

const deployOrderSigner: DeployFunction = async ({
  ethers,
  getNamedAccounts,
  deployments,
}) => {
  const { deploy, getNetworkName } = deployments;
  const [signer] = await ethers.getSigners();
  console.log("deploying using account", signer.address);

  const deployer = ethers.provider.getSigner(signer.address);
  let GPv2SigningAddress = "0x9008D19f58AAbD9eD0D60971565AA8510560ab41";

  const OrderSigner = await ethers.getContractFactory("CowswapOrderSigner");
  const initData = defaultAbiCoder.encode(["address"], [GPv2SigningAddress]);
  const defaultSalt =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const singletonFactoryAddress = "0xce0042b868300000d44a59004da54a005ffdcf9f";

  const orderSignerAddress = getCreate2Address(
    singletonFactoryAddress,
    defaultSalt,
    keccak256(OrderSigner.bytecode + initData.slice(2))
  );

  console.log("expected address", orderSignerAddress);

  const singletonFactory = await getSingletonFactory(deployer);

  const gasPrice = await signer.getGasPrice();
  console.log(
    "account needs ETH (not all will be spent)",
    formatEther(BigNumber.from("450000").mul(gasPrice)),
    "at gas price: " + formatUnits(gasPrice, "gwei") + " gwei"
  );

  await singletonFactory.deploy(
    OrderSigner.bytecode + initData.slice(2),
    defaultSalt,
    { gasLimit: BigNumber.from("450000") }
  );

  if ((await signer.provider.getCode(orderSignerAddress)).length > 2) {
    console.log(
      `  \x1B[32m✔ Mastercopy deployed to:        ${orderSignerAddress} 🎉\x1B[0m `
    );
  } else {
    console.log("  \x1B[31m✘ Deployment failed.\x1B[0m");
  }
};

export default deployOrderSigner;
