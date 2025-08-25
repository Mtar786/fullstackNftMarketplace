// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Basic NFT contract used by the marketplace
/// @notice This ERC721 contract mints tokens with on‑chain references to off‑chain metadata.  When a token
///         is minted via createToken(), it automatically approves the NFT marketplace contract to transfer
///         the token on behalf of the owner, enabling seamless listing and sales without requiring a second
///         transaction.
contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // The address of the marketplace that should be approved to handle tokens
    address public marketplaceAddress;

    constructor(address marketplaceAddress_) ERC721("NFT Market Tokens", "NMT") {
        marketplaceAddress = marketplaceAddress_;
    }

    /// @notice Mint a new token and set its metadata URI
    /// @param tokenURI The URI pointing to the off‑chain metadata (e.g. IPFS json file)
    /// @return tokenId The identifier of the newly minted token
    function createToken(string memory tokenURI) public returns (uint256 tokenId) {
        _tokenIds.increment();
        tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        // Automatically approve marketplace to transfer the token on the owner's behalf
        setApprovalForAll(marketplaceAddress, true);
    }
}