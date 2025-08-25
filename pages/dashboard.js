import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import Web3Modal from 'web3modal';
import NFTCard from '../components/NFTCard';
import { nftaddress, nftmarketaddress } from '../constants/addresses';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Marketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';

export default function Dashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(nftmarketaddress, Marketplace.abi, signer);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();
    const items = await Promise.all(
      data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
          price,
          itemId: i.itemId.toNumber(),
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    const soldItems = items.filter(i => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoadingState('loaded');
  }

  if (loadingState === 'loaded' && !nfts.length)
    return (
      <h1 className="py-10 px-20 text-3xl">No items created</h1>
    );

  return (
    <div>
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: '1200px' }}>
          <h2 className="text-2xl py-2">Items Created</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {nfts.map((nft, i) => (
              <NFTCard key={i} nft={nft} />
            ))}
          </div>
        </div>
      </div>
      {Boolean(sold.length) && (
        <div className="flex justify-center">
          <div className="px-4" style={{ maxWidth: '1200px' }}>
            <h2 className="text-2xl py-2">Items Sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft, i) => (
                <NFTCard key={i} nft={nft} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}