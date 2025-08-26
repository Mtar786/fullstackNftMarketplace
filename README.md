# Full‑Stack NFT Marketplace


This repository contains a complete end‑to‑end NFT marketplace built with **Solidity**, **Hardhat** and **Next.js**.  The project allows users to mint ERC‑721 non‑fungible tokens, list them for sale, buy existing NFTs and view their personal collections.  It supports deployment to any EVM‑compatible network, including **Ethereum** and **Polygon**.

## Features

- **Solidity smart contracts** for an NFT (`NFT.sol`) and a marketplace (`NFTMarketplace.sol`).  The marketplace supports minting, listing, purchasing, and querying items.
- **Hardhat** configuration for compilation, local testing and deployment.  The deployment script deploys both contracts and prints their addresses.
- **Next.js** front‑end with pages for creating NFTs, viewing the global market, viewing your owned items and viewing items you listed for sale.  The UI is styled with Tailwind CSS.
- **IPFS integration** via `ipfs-http-client` for storing image files and metadata.  You will need an IPFS gateway (e.g. [Infura](https://infura.io/) or [Pinata](https://www.pinata.cloud/)) to store content.
- **Web3Modal** integration to easily connect to MetaMask or other injected providers.  The application automatically adjusts to the connected network (e.g. Ethereum or Polygon) as long as the correct contract addresses are supplied.

## Prerequisites

1. **Node.js** (v18 or later) and **npm** installed on your machine.
2. **MetaMask** or another Ethereum wallet browser extension.
3. An **RPC endpoint** and **private key** for the network(s) you wish to deploy to (e.g. Goerli for Ethereum testnet or Mumbai for Polygon testnet).  You can obtain RPC URLs from Infura, Alchemy or other providers.
4. An **IPFS gateway**.  Infura and Pinata both provide IPFS services.  This project uses `ipfs-http-client` which requires a project ID and secret if you use Infura.

## Getting Started

Clone the repository and install dependencies:

```bash
git clone <your-fork-or-clone-url>
cd full-stack-nft-marketplace
npm install
```

### Environment Variables

Create a `.env` file in the root of the project and supply the following variables:

```ini
PRIVATE_KEY=<your_deployer_private_key>
ETH_RPC_URL=<your_ethereum_rpc_url>
POLYGON_RPC_URL=<your_polygon_rpc_url>

# IPFS configuration (Infura example)
IPFS_PROJECT_ID=<your_ipfs_project_id>
IPFS_PROJECT_SECRET=<your_ipfs_project_secret>
```

- `PRIVATE_KEY` – the private key of the account that will deploy the contracts.  **Do not commit this file to version control.**
- `ETH_RPC_URL` – the Ethereum JSON‑RPC endpoint (e.g. a Goerli or mainnet URL from Infura/Alchemy).
- `POLYGON_RPC_URL` – the Polygon JSON‑RPC endpoint (e.g. Mumbai or Polygon mainnet).
- `IPFS_PROJECT_ID` and `IPFS_PROJECT_SECRET` – credentials for your IPFS gateway.

You may duplicate this file as `.env.example` and replace values with placeholders for other collaborators.

### Compile and Deploy Contracts

Use Hardhat to compile the contracts:

```bash
npm run compile
```

To deploy the contracts to a local Hardhat network:

```bash
# Start a local node in a separate terminal
npx hardhat node

# In another terminal, deploy the contracts
npm run deploy
```

By default the deployment script prints the addresses of the `NFTMarketplace` and `NFT` contracts.  Copy these addresses into `constants/addresses.js` in the front‑end so that the UI points to the correct contracts.

To deploy to a live testnet or mainnet, add network configurations to **hardhat.config.js** (see the comments inside that file) and run:

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

### Running the Front‑End

After deploying your contracts and updating `constants/addresses.js`, start the Next.js development server:

```bash
npm run dev
```

Open your browser at `http://localhost:3000` to interact with the marketplace.  MetaMask will prompt you to connect when necessary.

### Directory Structure

```
full-stack-nft-marketplace/
├── contracts/                # Solidity smart contracts
│   ├── NFT.sol
│   └── NFTMarketplace.sol
├── scripts/
│   └── deploy.js            # Hardhat deployment script
├── pages/                   # Next.js pages
│   ├── _app.js
│   ├── index.js             # Browse all market items
│   ├── create.js            # Mint and list a new NFT
│   ├── my-nfts.js           # View NFTs you own
│   └── dashboard.js         # View NFTs you have created
├── components/
│   └── NFTCard.js           # Reusable component for displaying NFTs
├── constants/
│   └── addresses.js         # Contract addresses
├── styles/
│   └── globals.css          # Tailwind CSS styles
├── hardhat.config.js        # Hardhat configuration
├── package.json
├── .gitignore
└── README.md
```

### Notes

- This codebase is a starting point for building production‑ready NFT marketplaces.  In production you should harden the contracts, handle royalties and secondary sales, and conduct thorough security audits.
- The default listing price in `NFTMarketplace.sol` is set to **0.025 ether**.  You can adjust this constant as needed.
- When deploying to a new network, always verify that the contract addresses in `constants/addresses.js` match your latest deployments.

## License

This project is released under the MIT license.  See [LICENSE](LICENSE) for more information.
