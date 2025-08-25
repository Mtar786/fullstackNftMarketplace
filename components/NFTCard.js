import React from 'react';

/**
 * Display an individual NFT with its image, name, description and price.  When `onPurchase` is provided,
 * the component will render a button to buy the NFT.  Otherwise it simply shows the NFT metadata.
 *
 * @param {{ nft: any, onPurchase?: () => void }} props
 */
export default function NFTCard({ nft, onPurchase }) {
  return (
    <div className="border shadow rounded-xl overflow-hidden">
      {nft.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={nft.image} alt={nft.name} className="h-80 w-full object-cover" />
      )}
      <div className="p-4">
        <p className="text-2xl font-semibold truncate">{nft.name}</p>
        <p className="text-gray-500 overflow-hidden" style={{ height: '70px' }}>
          {nft.description}
        </p>
      </div>
      <div className="p-4 bg-gray-100">
        <p className="text-xl font-bold">{nft.price} ETH</p>
        {onPurchase && (
          <button
            className="mt-4 w-full bg-blue-500 text-white font-bold py-2 px-4 rounded"
            onClick={onPurchase}
          >
            Buy
          </button>
        )}
      </div>
    </div>
  );
}