// SPDX-License-Identifier: UNLICENSED
// Infinity Keys 2022
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./VerifySigner.sol";
import "./CheckExternalNFT.sol";

// TODO:
// Add Supply, price in token struct
// Figure out payment structure - how to pay creators if they are selling
// Delete release functions for payment spllitter ?
// Wallet of owner
// Wallets who owns an NFT ?

contract InfinityKeysCreators is ERC1155Supply, VerifySigner, CheckExternalNFT {
  using Strings for uint256;
  using Counters for Counters.Counter;
  Counters.Counter private counter;

  string public name;
  string public symbol;

  string public baseURI = "www.infinitykeys.io/api/metadata/";
  string public suffixURI = "";

  mapping(uint256 => Token) private tokens;

  /** 
    @dev for token gating mints.
    */
  enum GateState {
    noGate,
    internalGate,
    externalGate
  }

  struct Token {
    bool mintable;
    GateState gate;
    uint256[] internalGateIDs;
    address externalGateContract;
    bool external721;
    uint256 externalTokenID;
    mapping(address => bool) minted;
  }

  event Minted(uint256 indexed _tokenID, address indexed _account);

  constructor(
    string memory _name,
    string memory _symbol,
    address _signer,
    string memory _secret
  ) ERC1155("https://www.infinitykeys.io") {
    name = _name;
    symbol = _symbol;
    setSecret(_secret);
    setSigner(_signer);
  }

  /**
    @dev Fallback function.
    */
  fallback() external payable {}

  /**
    @dev Receive function.
    */
  receive() external payable virtual {}

  /**
    @dev Returns a token.
     */
  function getToken(uint256 _tokenID)
    external
    view
    returns (
      bool,
      GateState,
      uint256[] memory,
      address,
      bool,
      uint256
    )
  {
    require(exists(_tokenID), "getToken: Token ID does not exist");
    Token storage t = tokens[_tokenID];

    return (
      t.mintable,
      t.gate,
      t.internalGateIDs,
      t.externalGateContract,
      t.external721,
      t.externalTokenID
    );
  }

  /**
    @dev Adds a new token.
    */
  function addToken(
    bool _mintable,
    GateState _gateState,
    uint256[] memory _internalGateIDs,
    address _externalGateContract,
    bool _external721,
    uint256 _externalTokenID
  ) public onlyAuthorized {
    Token storage t = tokens[counter.current()];

    t.mintable = _mintable;
    t.gate = _gateState;
    t.internalGateIDs = _internalGateIDs;
    t.externalGateContract = _externalGateContract;
    t.external721 = _external721;
    t.externalTokenID = _externalTokenID;

    counter.increment();
  }

  /**
    @dev Add token caller for default states on gate IDs.
    */
  function addTokenUngated(bool _mintable) public onlyAuthorized {
    addToken(
      _mintable,
      GateState.noGate,
      new uint256[](0),
      address(0),
      false,
      0
    );
  }

  /**
    @dev Edits an existing token.
    */
  function editToken(
    uint256 _tokenID,
    bool _mintable,
    GateState _gateState,
    uint256[] memory _internalGateIDs,
    address _externalGateContract,
    bool _external721,
    uint256 _externalTokenID
  ) external onlyAuthorized {
    require(exists(_tokenID), "EditToken: Token ID does not exist");

    Token storage t = tokens[_tokenID];
    t.mintable = _mintable;
    t.gate = _gateState;
    t.internalGateIDs = _internalGateIDs;
    t.externalGateContract = _externalGateContract;
    t.external721 = _external721;
    t.externalTokenID = _externalTokenID;
  }

  /**
    @dev Sets base token uri.
     */
  function setBaseURI(string memory _newBaseURI, string memory _newSuffixURI)
    external
    onlyOwner
  {
    baseURI = _newBaseURI;
    suffixURI = _newSuffixURI;
  }

  /**
    @dev Sets token mint state.
     */
  function setTokenMintable(uint256 _tokenID, bool _mintable)
    external
    onlyAuthorized
  {
    require(exists(_tokenID), "setTokenMintable: Token ID does not exist");
    Token storage t = tokens[_tokenID];
    t.mintable = _mintable;
  }

  /**
    @dev Send specified token to specified address.
     */
  function airdrop(uint256 _tokenID, address _address) external onlyAuthorized {
    require(exists(_tokenID), "airdrop: token does not exist");

    _mint(_address, _tokenID, 1, "");
  }

  /**
    @dev Handle token mints.
    */
  function mint(uint256 _tokenID, bytes memory _signature) external payable {
    require(exists(_tokenID), "mint: token does not exist");
    require(isSaleOpen(_tokenID), "mint: sale is closed");
    require(
      !checkIfMinted(_tokenID, msg.sender),
      "mint: NFT already minted by address"
    );
    require(verify(_tokenID, _signature), "mint: Server Verification Failed.");
    require(
      gateCheck(_tokenID, msg.sender),
      "mint: Address does not own requisite NFT"
    );

    tokens[_tokenID].minted[msg.sender] = true;

    _mint(msg.sender, _tokenID, 1, "");

    emit Minted(_tokenID, msg.sender);
  }

  /**
    @dev Return whether mints are open for a certain tokenID.
    */
  function isSaleOpen(uint256 _tokenID) public view returns (bool) {
    require(exists(_tokenID), "isSaleClosed: token does not exist");
    return tokens[_tokenID].mintable;
  }

  /**
    @dev Check if specified address has minted specified tokenID.
    */
  function checkIfMinted(uint256 _tokenID, address _address)
    public
    view
    returns (bool)
  {
    require(exists(_tokenID), "checkIfMinted: token does not exist");
    if (tokens[_tokenID].minted[_address]) return true;
    return false;
  }

  /**
    @dev Return array of totalSupply for all tokens.
    */
  function totalSupplyAll() external view returns (uint256[] memory) {
    uint256[] memory result = new uint256[](counter.current());

    for (uint256 i; i < counter.current(); i++) {
      result[i] = totalSupply(i);
    }

    return result;
  }

  /**
    @dev Check if msg.sender can mint NFT based on:
    * An Internal Gate (must own another token on this contract)
    * An External Gate (must own a partner NFT)
    */
  function gateCheck(uint256 _tokenID, address _address)
    private
    view
    returns (bool)
  {
    GateState gate = tokens[_tokenID].gate;

    if (gate == GateState.noGate) {
      return true;
    } else if (gate == GateState.internalGate) {
      return checkInternalNFTs(_address, tokens[_tokenID].internalGateIDs);
    } else if (gate == GateState.externalGate) {
      return
        checkExternalNFT(
          _address,
          tokens[_tokenID].externalGateContract,
          tokens[_tokenID].external721,
          tokens[_tokenID].externalTokenID
        );
    }
    return false;
  }

  /**
    @dev Checks if specified address owns specified NFT(s) on this contract 
    */
  function checkInternalNFTs(address _address, uint256[] memory _internalIDs)
    internal
    view
    returns (bool)
  {
    for (uint256 i; i < _internalIDs.length; ++i) {
      if (balanceOf(_address, _internalIDs[i]) == 0) {
        return false;
      }
    }
    return true;
  }

  /**
    @dev Indicates whether a token exists with a given tokenID.
    */
  function exists(uint256 _tokenID) public view override returns (bool) {
    return counter.current() > _tokenID;
  }

  /**
    @dev Return URI for existing tokenID.
    */
  function uri(uint256 _tokenID) public view override returns (string memory) {
    require(exists(_tokenID), "URI: nonexistent token");
    return string(abi.encodePacked(baseURI, _tokenID.toString(), suffixURI));
  }

  /**
    @dev onlyOwner- release ETH to given address (onlyOwner)
    */
  function release(address payable _address, uint256 _amount) public onlyOwner {
    require(_amount <= address(this).balance, "release: Inavlid amount.");
    Address.sendValue(_address, _amount);
  }

  /**
    @dev onlyOwner- release given ERC20 to given address (onlyOwner)
    */
  function release(
    IERC20 _token,
    address _address,
    uint256 _amount
  ) public onlyOwner {
    require(
      _amount <= _token.balanceOf(address(this)),
      "release: insufficient tokens ERC20 called."
    );
    SafeERC20.safeTransfer(_token, _address, _amount);
  }
}
