import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json';

const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
	'https://testnets.opensea.io/collection/trianglenft-ihcu4xsdrp';
const RARIBLE_LINK =
	'https://rinkeby.rarible.com/collection/0xf165dc27c61da82bc450b86f1627de5a7abc92c1';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = '0xF165dC27c61DA82BC450b86f1627De5a7AbC92C1';
const RINKEBY_CHAIN_ID = '0x4';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [openSeaUrl, setOpenSeaUrl] = useState('');
	const [NFTsMinted, setNFTsMinted] = useState(0);
	const [isMinting, setIsMinting] = useState(false);

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		} else {
			console.log('We have the ethereum object', ethereum);
		}

		let chainId = await ethereum.request({ method: 'eth_chainId' });
		console.log('Connected to chain ' + chainId);

		if (chainId !== RINKEBY_CHAIN_ID) {
			alert('You are not connected to the Rinkeby Test Network!');
			return;
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account:', account);
			setCurrentAccount(account);
			setupEventListener();
		} else {
			console.log('No authorized account found');
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts',
			});

			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
			setupEventListener();
		} catch (error) {
			console.log(error);
		}
	};

	const askContractToMintNft = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					myEpicNft.abi,
					signer
				);

				console.log('Going to pop wallet now to pay gas...');
				let nftTxn = await connectedContract.makeAnEpicNFT();

				setIsMinting(true);
				console.log('Mining...please wait.');
				await nftTxn.wait();

				console.log(
					`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
				);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const setupEventListener = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					myEpicNft.abi,
					signer
				);

				const NFTsMinted = await connectedContract.getTotalNFTsMinted();
				setNFTsMinted(NFTsMinted.toNumber());

				connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
					setOpenSeaUrl(
						`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
					);
					setNFTsMinted(tokenId.toNumber() + 1);
					setIsMinting(false);
				});

				console.log('Setup event listener!');
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	/* eslint-disable */
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);
	/* eslint-enable */

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header gradient-text">My NFT Collection</p>
					<p className="sub-text">
						Each unique. Each beautiful. Discover your NFT today.
					</p>

					{currentAccount === '' ? (
						<button
							onClick={connectWallet}
							className="cta-button connect-wallet-button"
						>
							Connect to Wallet
						</button>
					) : isMinting ? (
						<div className="minting">
							Minting...&nbsp;
							<div className="pick-container">
								<span role="img" aria-label="Pick" className="pick">
									⛏️
								</span>
								<span role="img" aria-label="Pick" className="pick pick-2">
									⛏️
								</span>
							</div>
							<span role="img" aria-label="Person Kneeling" className="person">
								🧎
							</span>
						</div>
					) : (
						<button
							onClick={askContractToMintNft}
							className="cta-button connect-wallet-button"
						>
							<span role="img" aria-label="Pick">
								⛏️
							</span>
							&nbsp;Mint NFT
						</button>
					)}
					<div className="mint-container">
						{currentAccount && (
							<p className="sub-text">
								NFTs minted: {NFTsMinted} / {TOTAL_MINT_COUNT}
							</p>
						)}
					</div>

					<a
						className="opensea-link view-collection"
						href={OPENSEA_LINK}
						target="_blank"
						rel="noopener noreferrer"
					>
						<span role="img" aria-label="Water Wave">
							🌊
						</span>{' '}
						View Collection on OpenSea
					</a>
					<a
						className="opensea-link view-collection"
						href={RARIBLE_LINK}
						target="_blank"
						rel="noopener noreferrer"
					>
						<span role="img" aria-label="Water Wave">
							🌊
						</span>{' '}
						View Collection on Rarible
					</a>

					{openSeaUrl && (
						<p className="sub-text">
							We've minted your NFT and sent it to your wallet. It may be blank
							right now. It can take a max of 10 min to show up on OpenSea.
							Here's the&nbsp;
							<a
								className="opensea-link"
								href={openSeaUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								link
							</a>
							:
						</p>
					)}
				</div>

				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noopener noreferrer"
					>{`built on @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
