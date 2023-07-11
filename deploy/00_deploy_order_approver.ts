import { defaultAbiCoder } from "@ethersproject/abi";
import { DeployFunction } from "hardhat-deploy/types";
import { deployMastercopyWithInitData } from "@gnosis.pm/zodiac";
import { getCreate2Address, keccak256 } from "ethers/lib/utils";

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

  console.log("expected adress", orderSignerAddress);
  await deployMastercopyWithInitData(
    deployer,
    OrderSigner.bytecode + initData.slice(2),
    defaultSalt
  );
};

export default deployOrderSigner;
