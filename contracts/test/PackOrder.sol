// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.12;

import "../CowswapOrderSigner.sol";

contract PackOrder is CowswapOrderSigner {
    constructor(GPv2Signing _signing) CowswapOrderSigner(_signing) {}
    function publicPackOrder(
        IERC20 sellToken,
        IERC20 buyToken,
        uint256 sellAmount,
        uint256 buyAmount,
        uint32 validTo,
        uint256 feeAmountBP,
        bytes32 kind,
        bool partiallyFillable,
        bytes32 sellTokenBalance,
        bytes32 buyTokenBalance
    ) public view returns (bytes memory) {
        return super.packOrder(
            sellToken,
            buyToken,
            sellAmount,
            buyAmount,
            validTo,
            feeAmountBP,
            kind,
            partiallyFillable,
            sellTokenBalance,
            buyTokenBalance
        );
    }
}