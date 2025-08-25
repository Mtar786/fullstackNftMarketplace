import { useState } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Marketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { nftaddress, nftmarketaddress } from '../constants/addresses';

// Configure the IPFS client.  If environment variables for an Infura project ID and secret are
// provided, use them to authenticate.  Otherwise fall back to an unauthenticated client.
let ipfsClient;
const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET;
if (projectId && projectSecret) {
  const auth =
    'Basic ' +
    Buffer.from(`${projectId}:${projectSecret}`).toString('base64');
  ipfsClient = ipfsHttpClient({
    url: 'https://ipfs.infura.io:5001/api/v0',
    headers: {
      authorization: auth,
    },
  });
} else {
  ipfsClient = ipfsHttpClient({ url: 'https://ipfs.infura.io:5001/api/v0' });
}

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formInput, setFormInput] = useState({ name: '', description: '', price: '' });
  const router = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const added = await ipfsClient.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.error('Error uploading file: ', error);
    } finally {
      setUploading(false);
    }
  }

  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    // Upload metadata to IPFS
    const data = JSON.stringify({ name, description, image: fileUrl });
    try {
      const added = await ipfsClient.add(data);
      const url = `https://ipfs.io/ipfs/${added.path}`;
      // Create the NFT and list it on the marketplace
      await createSale(url);
    } catch (error) {
      console.error('Error uploading metadata: ', error);
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    // Mint the NFT
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await tokenContract.createToken(url);
    let tx = await transaction.wait();
    // The event emitted when creating the token returns the token ID as the third argument
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    const price = ethers.utils.parseUnits(formInput.price, 'ether');
    // List the NFT on the marketplace
    const marketContract = new ethers.Contract(nftmarketaddress, Marketplace.abi, signer);
    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();
    transaction = await marketContract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push('/');
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in ETH"
          className="mt-2 border rounded p-4"
          onChange={(e) => setFormInput({ ...formInput, price: e.target.value })}
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="rounded mt-4" width="350" src={fileUrl} alt="NFT preview" />
        )}
        <button
          onClick={createMarket}
          className="font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg"
        >
          {uploading ? 'Uploading...' : 'Create Digital Asset'}
        </button>
      </div>
    </div>
  );
}