// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.12;

import "../cowProtocol/libraries/GPv2Order.sol";
import "../CowswapOrderSigner.sol";

contract PackOrder is CowswapOrderSigner {
using GPv2Order for GPv2Order.Data;

    bytes32 immutable _domainSeparator;
    address immutable _deployedAt;

    constructor(GPv2Signing _signing) CowswapOrderSigner(_signing) { 
        _domainSeparator = _signing.domainSeparator();
        _deployedAt = address(this);
    }
    
    function publicPackOrder(
        IERC20 sellToken,
        IERC20 buyToken,
        uint256 sellAmount,
        uint256 buyAmount,
        uint32 validTo,
        uint256 feeAmount,
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
            feeAmount,
            kind,
            partiallyFillable,
            sellTokenBalance,
            buyTokenBalance
        );
    }

    function GPv2PackOrder(
        IERC20 sellToken,
        IERC20 buyToken,
        uint256 sellAmount,
        uint256 buyAmount,
        uint32 validTo,
        uint256 feeAmount,
        bytes32 kind,
        bool partiallyFillable,
        bytes32 sellTokenBalance,
        bytes32 buyTokenBalance
    ) public view returns (bytes memory) {
        GPv2Order.Data memory order;
        order.sellToken = sellToken;
        order.buyToken = buyToken;
        order.receiver = address(this);
        order.sellAmount = sellAmount;
        order.buyAmount = buyAmount;
        order.validTo = validTo;
        order.appData = bytes32(uint256(uint160(deployedAt)));
        order.feeAmount = feeAmount;
        order.kind = kind;
        order.partiallyFillable = partiallyFillable;
        order.sellTokenBalance = sellTokenBalance;
        order.buyTokenBalance = buyTokenBalance;

        bytes32 orderDigest = order.hash(domainSeparator);
        bytes memory orderUid = new bytes(GPv2Order.UID_LENGTH);
        GPv2Order.packOrderUidParams(
            orderUid,
            orderDigest,
            address(this),
            validTo);

        return orderUid;
    }
}