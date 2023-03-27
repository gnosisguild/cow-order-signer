import { defaultAbiCoder } from "@ethersproject/abi";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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

    // Fixtures can return anything you consider useful for your tests
    return { orderSigner, packOrder, avatar, alice, bob, eve };
  }

  describe("deployment", () => {
    it("CowswapOrderSigner should be deployed", async () => {
      const { orderSigner, alice } = await loadFixture(deployOrderSigner);

      const bytecode = await alice.provider?.getCode(orderSigner.address);

      expect(bytecode).to.not.equal("0x");
    });
  });

  describe("pack order", () => {
    it("should pack order correctly", async () => {
      const { packOrder, alice } = await loadFixture(deployOrderSigner);

      const order = {
        sellToken: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
        buyToken: "0x91056d4a53e1faa1a84306d4deaec71085394bc8",
        sellAmount: BigNumber.from("96825924243465932"),
        buyAmount: BigNumber.from("474505929366652675891"),
        validTo: 1679356004,
        feeAmountBP: Math.floor((5174075756534068 / 96825924243465932) * 10000), // = 534
        kind: ethers.utils.id("sell"),
        partiallyFillable: false,
        sellTokenBalance: ethers.utils.id("erc20"),
        buyTokenBalance: ethers.utils.id("erc20"),
      };

      const GPv2Order = {
        ...order,
        feeAmount: order.sellAmount.mul(534).div(10000),
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
        order.sellToken,
        order.buyToken,
        order.sellAmount,
        order.buyAmount,
        order.validTo,
        order.feeAmountBP,
        order.kind,
        order.partiallyFillable,
        order.sellTokenBalance,
        order.buyTokenBalance
      );
      expect(uid).to.equal(expectedUid);
    });
  });

  // describe("presigning", () => {
  //   it("should allow presigning with a delegateCall", async () => {
  //     const { orderSigner, avatar } = await loadFixture(deployOrderSigner);

  //     const order = {
  //       sellToken: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,
  //       buyToken: 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2,
  //       sellAmount: 10000000000,
  //       buyAmount: 4959721654652700610,
  //       validTo: 1628035200,
  //       appData: 0xf785fae7a7c5abc49f3cd6a61f6df1ff26433392b066ee9ff2240ff1eb7ab6e4,
  //       feeAmount: 14075734,
  //       kind: "sell",
  //       partiallyFillable: false,
  //       receiver: ethers.constants.AddressZero,
  //     };

  //     await expect(avatar.exec(orderSigner.address, 0, [], 1)).to.not.be
  //       .reverted;

  //     console.log(avatar.address);
  //   });
  // });
});
