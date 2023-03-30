import { defaultAbiCoder } from "@ethersproject/abi";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { PackOrder, CowswapOrderSigner, TestAvatar } from "../typechain-types";
import { BigNumber } from "ethers";

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

describe("CowswapOrderSigner contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployOrderSigner() {
    const [deployer, alice, bob, eve] = await ethers.getSigners();
    const GPv2SigningAddress = "0x9008D19f58AAbD9eD0D60971565AA8510560ab41";

    const OrderSigner = await ethers.getContractFactory("CowswapOrderSigner");
    const orderSigner = (await OrderSigner.deploy(
      GPv2SigningAddress
    )) as CowswapOrderSigner;

    const PackOrder = await ethers.getContractFactory("PackOrder");
    const packOrder = (await PackOrder.deploy(GPv2SigningAddress)) as PackOrder;

    const Avatar = await ethers.getContractFactory("TestAvatar");
    const avatar = (await Avatar.deploy()) as TestAvatar;

    const timestamp = await time.latest();

    const demoOrder = {
      sellToken: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
      buyToken: "0x91056d4a53e1faa1a84306d4deaec71085394bc8",
      sellAmount: BigNumber.from("96825924243465932"),
      buyAmount: BigNumber.from("474505929366652675891"),
      validTo: timestamp,
      validDuration: 60 * 30, // 30 minutes
      feeAmount: BigNumber.from("5174075756534068"),
      feeAmountBP: Math.ceil((5174075756534068 / 96825924243465932) * 10000), // = 535 bps
      kind: ethers.utils.id("sell"),
      partiallyFillable: false,
      sellTokenBalance: ethers.utils.id("erc20"),
      buyTokenBalance: ethers.utils.id("erc20"),
    };

    // Fixtures can return anything you consider useful for your tests
    return { orderSigner, packOrder, avatar, demoOrder, alice, bob, eve };
  }

  describe("deployment", () => {
    it("CowswapOrderSigner should be deployed", async () => {
      const { orderSigner, demoOrder, alice } = await loadFixture(
        deployOrderSigner
      );

      const bytecode = await alice.provider?.getCode(orderSigner.address);

      expect(bytecode).to.not.equal("0x");
    });
  });

  describe("pack order", () => {
    it("should pack order correctly", async () => {
      const { packOrder, demoOrder, alice } = await loadFixture(
        deployOrderSigner
      );

      const GPv2Order = {
        ...demoOrder,
        feeAmount: demoOrder.feeAmount,
      };

      const expectedUid = await packOrder.GPv2PackOrder(
        GPv2Order.sellToken,
        GPv2Order.buyToken,
        GPv2Order.sellAmount,
        GPv2Order.buyAmount,
        GPv2Order.validTo,
        GPv2Order.feeAmount,
        GPv2Order.kind,
        GPv2Order.partiallyFillable,
        GPv2Order.sellTokenBalance,
        GPv2Order.buyTokenBalance
      );

      const uid = await packOrder.publicPackOrder(
        demoOrder.sellToken,
        demoOrder.buyToken,
        demoOrder.sellAmount,
        demoOrder.buyAmount,
        demoOrder.validTo,
        demoOrder.feeAmount,
        demoOrder.kind,
        demoOrder.partiallyFillable,
        demoOrder.sellTokenBalance,
        demoOrder.buyTokenBalance
      );
      expect(uid).to.equal(expectedUid);
    });
  });

  describe("DelegateCall", () => {
    it("should allow signing with a delegateCall", async () => {
      const { orderSigner, avatar, demoOrder } = await loadFixture(
        deployOrderSigner
      );

      const { data } = await orderSigner.populateTransaction.signOrder(
        demoOrder.sellToken,
        demoOrder.buyToken,
        demoOrder.sellAmount,
        demoOrder.buyAmount,
        demoOrder.validTo,
        demoOrder.validDuration,
        demoOrder.feeAmount,
        demoOrder.feeAmountBP,
        demoOrder.kind,
        demoOrder.partiallyFillable,
        demoOrder.sellTokenBalance,
        demoOrder.buyTokenBalance
      );

      await expect(avatar.exec(orderSigner.address, 0, data || "", 1)).to.not.be
        .reverted;
    });
  });

  describe("Bad Orders", () => {
    it("Order with fee BP lower than fee amount should revert", async () => {
      const { orderSigner, avatar, demoOrder } = await loadFixture(
        deployOrderSigner
      );

      demoOrder.feeAmountBP = 100; // was 535

      const { data } = await orderSigner.populateTransaction.signOrder(
        demoOrder.sellToken,
        demoOrder.buyToken,
        demoOrder.sellAmount,
        demoOrder.buyAmount,
        demoOrder.validTo,
        demoOrder.validDuration,
        demoOrder.feeAmount,
        demoOrder.feeAmountBP,
        demoOrder.kind,
        demoOrder.partiallyFillable,
        demoOrder.sellTokenBalance,
        demoOrder.buyTokenBalance
      );

      await expect(avatar.exec(orderSigner.address, 0, data || "", 1)).to.be
        .reverted;
    });

    it("Order with a validTo outside validDuration should revert", async () => {
      const { orderSigner, avatar, demoOrder } = await loadFixture(
        deployOrderSigner
      );

      demoOrder.validTo = demoOrder.validTo + demoOrder.validDuration + 60;

      const { data } = await orderSigner.populateTransaction.signOrder(
        demoOrder.sellToken,
        demoOrder.buyToken,
        demoOrder.sellAmount,
        demoOrder.buyAmount,
        demoOrder.validTo,
        demoOrder.validDuration,
        demoOrder.feeAmount,
        demoOrder.feeAmountBP,
        demoOrder.kind,
        demoOrder.partiallyFillable,
        demoOrder.sellTokenBalance,
        demoOrder.buyTokenBalance
      );

      await expect(avatar.exec(orderSigner.address, 0, data || "", 1)).to.be
        .reverted;
    });
  });
});
