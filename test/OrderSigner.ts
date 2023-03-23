import { defaultAbiCoder } from "@ethersproject/abi";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

describe("CowswapOrderSigner contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployOrderSigner() {
    const OrderSigner = await ethers.getContractFactory("CowswapOrderSigner");
    const [deployer, alice, bob, eve] = await ethers.getSigners();
    const GPv2SigningAddress = "0x9008D19f58AAbD9eD0D60971565AA8510560ab41";
    const orderSigner = await OrderSigner.deploy(GPv2SigningAddress);

    await orderSigner.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { OrderSigner, orderSigner, alice, bob, eve };
  }

  describe("deployment", () => {
    it("CowswapOrderSigner should be deployed", async () => {
      const { orderSigner, alice } = await loadFixture(deployOrderSigner);

      const bytecode = await alice.provider?.getCode(orderSigner.address);

      expect(bytecode).to.not.equal("0x");
    });
  });
});
