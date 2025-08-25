// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Marketplace for NFTs
/// @notice This contract allows users to create market listings for ERC721 tokens, purchase listed tokens,
///         and query the market.  It charges a small listing fee on each sale to support the platform.
contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;   // Track the total number of items ever created
    Counters.Counter private _itemsSold; // Track the number of items sold

    // The owner receives listing fees
    address payable public owner;
    // Listing fee for creating a market item
    uint256 public listingPrice = 0.025 ether;

    // Structure to represent a market listing
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    // Mapping from item ID to market item
    mapping(uint256 => MarketItem) private idToMarketItem;

    // Events
    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event MarketItemSold(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    constructor() {
        owner = payable(msg.sender);
    }

    /// @notice Returns the listing fee required to create a market item
    function getListingPrice() external view returns (uint256) {
        return listingPrice;
    }

    /// @notice Create a new market listing
    /// @param nftContract The address of the ERC721 contract
    /// @param tokenId The token identifier to list
    /// @param price The sale price in wei
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Listing fee must be paid");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        // Transfer the NFT from seller to the marketplace for escrow
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        idToMarketItem[itemId] = MarketItem({
            itemId: itemId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: payable(msg.sender),
            owner: payable(address(0)),
            price: price,
            sold: false
        });

        emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, price);
    }

    /// @notice Execute the purchase of a market item
    /// @param nftContract The address of the ERC721 contract
    /// @param itemId The market item identifier to purchase
    function createMarketSale(address nftContract, uint256 itemId)
        external
        payable
        nonReentrant
    {
        MarketItem storage item = idToMarketItem[itemId];
        require(msg.value == item.price, "Please submit the asking price");
        require(!item.sold, "Item already sold");

        // Pay the seller
        item.seller.transfer(msg.value);
        // Transfer the NFT to the buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, item.tokenId);

        // Update ownership and mark as sold
        item.owner = payable(msg.sender);
        item.sold = true;
        _itemsSold.increment();

        // Transfer listing fee to marketplace owner
        owner.transfer(listingPrice);

        emit MarketItemSold(itemId, nftContract, item.tokenId, item.seller, msg.sender, item.price);
    }

    /// @notice Fetch all unsold market items
    function fetchMarketItems() external view returns (MarketItem[] memory items) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = itemCount - _itemsSold.current();
        uint256 currentIndex = 0;
        items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].owner == address(0)) {
                MarketItem storage currentItem = idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
    }

    /// @notice Fetch market items that the caller owns
    function fetchMyNFTs() external view returns (MarketItem[] memory items) {
        uint256 totalItemCount = _itemIds.current();
        uint256 ownedItemCount = 0;
        uint256 currentIndex = 0;

        // Count how many items the caller owns
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                ownedItemCount++;
            }
        }
        items = new MarketItem[](ownedItemCount);
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                MarketItem storage currentItem = idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
    }

    /// @notice Fetch items that the caller has created as a seller
    function fetchItemsCreated() external view returns (MarketItem[] memory items) {
        uint256 totalItemCount = _itemIds.current();
        uint256 createdItemCount = 0;
        uint256 currentIndex = 0;

        // Count items created by caller
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                createdItemCount++;
            }
        }
        items = new MarketItem[](createdItemCount);
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                MarketItem storage currentItem = idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
    }
}