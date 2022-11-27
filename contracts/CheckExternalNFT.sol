// SPDX-License-Identifier: MIT
// 2022 Infinity Keys Team
pragma solidity ^0.8.17;

/************************************************************
 * @title: CheckExternalNFT                                  *
 * @notice: Check if address owns requisite NFT              *
 *************************************************************/

contract IExternal721 {
  function balanceOf(address _address) external view returns (uint256) {}
}

contract IExternal1155 {
  function balanceOf(address _address, uint256 _tokenId)
    external
    view
    returns (uint256)
  {}
}

abstract contract CheckExternalNFT {
  /**
    @dev Checks if specified address owns NFT on specified contract 
    */
  function checkExternalNFT(
    address _address,
    address _contract,
    bool _isIt721,
    uint256 _tokenId
  ) internal view returns (bool) {
    if (_isIt721) {
      IExternal721 externalNFT = IExternal721(_contract);
      return externalNFT.balanceOf(_address) > 0;
    } else {
      IExternal1155 externalNFT = IExternal1155(_contract);
      return externalNFT.balanceOf(_address, _tokenId) > 0;
    }
  }
}
