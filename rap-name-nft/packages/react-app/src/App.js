import {Contract} from "@ethersproject/contracts";
import {getDefaultProvider} from "@ethersproject/providers";
import React, {useEffect, useState} from "react";
import { ethers } from 'ethers';

import {Body, Button, Header} from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

import {abis, addresses} from "@project/contracts";
import {decode} from "base-64";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";

const Configuration = {
  abi: abis.rapNameNft.abi,
  rinkeby: {
    network: 'rinkeby',
    address: addresses.rinkebyRapNameNft,
    infura: 'wss://rinkeby.infura.io/ws/v3/ff20f5e62ffa435ea8bc23c49231cec8',
    openseaURL: (token) => `https://testnets.opensea.io/assets/rinkeby/${addresses.rinkebyRapNameNft}/${token}`
  },
  ropsten: {
    network: 'ropsten',
    address: addresses.ropstenRapNameNft,
    infura: 'wss://ropsten.infura.io/ws/v3/ff20f5e62ffa435ea8bc23c49231cec8',
    openseaURL: (token) => `https://ropsten.etherscan.io/token/${addresses.ropstenRapNameNft}?a=${token}`
  },
  mainnet: {
    network: 'mainnet',
    address: addresses.mainnetRapNameNft,
    infura: 'wss://mainnet.infura.io/ws/v3/ff20f5e62ffa435ea8bc23c49231cec8',
    openseaURL: (token) => `https://opensea.io/assets/${addresses.mainnetRapNameNft}/${token}`
  }
}
const config = Configuration.mainnet;

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  const [account, setAccount] = useState("");
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        if (!provider) {
          return;
        }

        // Load the user's accounts.
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);

        // Resolve the ENS name for the first account.
        const name = await provider.lookupAddress(accounts[0]);

        // Render either the ENS name or the shortened account address.
        if (name) {
          setRendered(name);
        } else {
          setRendered(account.substring(0, 6) + "..." + account.substring(36));
        }
      } catch (err) {
        setAccount("");
        setRendered("");
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setAccount, setRendered]);

  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function MintLabel({ provider, rapNft, loadWeb3Model, logoutOfWeb3Model }) {
  const [currentToken, setCurrentToken] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  useEffect(() => {
    if (!rapNft || !provider) {
      return;
    }

    (async () => {
      const _currentTokenId = (await rapNft.getCurrentTokenId()).toString();
      const _maxSupply = (await rapNft.MAX_SUPPLY()).toString();
      setMaxSupply(_maxSupply);
      setCurrentToken(_currentTokenId);
    })();
  }, [ provider, rapNft ]);

  return (

      (currentToken && maxSupply) ?
      <p style={{fontSize: '14px'}}>{ currentToken - 1 } minted out of { maxSupply }</p> :
          <WalletButton provider={provider} loadWeb3Modal={loadWeb3Model} logoutOfWeb3Modal={logoutOfWeb3Model} />
  )
}

function MintButton({ provider }) {
  if (!provider) {
    return <div/>
  }
  const signer = provider.getSigner();
  const contract = new Contract(config.address, abis.rapNameNft.abi, signer);

  const mintNextNft = async (numToMint, ether) => {
    await contract.mint(numToMint, {
      gasLimit: 800000 * numToMint,
      value: ethers.utils.parseEther(ether.toString()) // adding this should fix
    })
  }
  return (<div>
      <ButtonGroup onMint={(numToMint, price) => { mintNextNft(numToMint, price) }}/>
      </div>
    )
}

function GalleryItem({ account, rapNft, tokenId }) {
  const [isOwner, setIsOwner] = useState(false);
  const [svgImage, setSvgImage] = useState("");
  useEffect (() => {
    if (!rapNft) {
      return;
    }
    (async () => {
      const _b64AppData = (await rapNft.tokenURI(tokenId)).toString();
      const _ownerId = (await rapNft.ownerOf(tokenId)).toString();
      const _appDataJSON =  decode(_b64AppData.replace('data:application/json;base64,', ''));
      const _appData = JSON.parse(_appDataJSON);
      setSvgImage(_appData.image);
      setIsOwner(_ownerId === account.toString());
    })();
  }, [ account, rapNft, tokenId ]);

  return (
      <Card style={{
        'margin': '20px',
        'background': 'white',
        'width': '300px',
        'height': '200px',
        'color': 'black',
        'overflowWrap': 'break-word',
        'fontSize': '14px'
      }}>
        <CardMedia style={{'position': 'relative'}}>
          { isOwner ? (<div style={{'position': 'absolute', 'top': '5px', 'left': '5px', 'fontSize': '24px' }}>☑️️</div>) : <div /> }
          <a  rel="noreferrer" target={"_blank"} href={config.openseaURL(tokenId)} style={{
            'textDecoration': 'unset', 'position': 'absolute', 'top': '5px', 'right': '5px', 'fontSize': '24px'
          }}>➡️️️</a>
          <img alt={`${tokenId}`} src={ svgImage }  width={"500px"} height={"200px"}/>
        </CardMedia>
      </Card>
  )
}

function ButtonGroup({onMint}) {
  const [count, setCount] = useState(1);
  const IncNum = () => {
    if (count >= 10) {
      alert("max limit reached");
      setCount(10);
      return;
    }
    setCount(count + 1);
  };
  const DecNum = () => {
    if (count > 0) setCount(count - 1);
    else {
      setCount(0);
      alert("min limit reached");
    }
  };
  return (
      <>
        <div className="main_div">
          <div style={{'textAlign': 'center'}}>
            <div>
              <Button onClick={DecNum}>
                <RemoveIcon />
              </Button>
              <Button onClick={IncNum}>
                <AddIcon />
              </Button>
            </div>
            <br />
            <Button onClick={() => onMint(count, count * 0.02) } >Mint {count} ({count * 0.02} ETH)</Button>
          </div>
        </div>
      </>
  );
}

function MintGallery({ provider, rapNft }) {
  const [tokenCount, setTokenCount] = useState(0);
  const [account, setAccount] = useState("");
  useEffect( () => {
    if (!rapNft || !provider) {
      return
    }
    (async () => {
      setTokenCount(parseInt((await rapNft.getCurrentTokenId()).toString(), 10));
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount("");
      }
    })();
  }, [ provider, rapNft ]);
  return <div style={{
    'alignItems': 'center',
    'justifyContent': 'center',
    'textAlign': 'center',
    'display':'flex',
    'flexWrap': 'wrap',
    'flexDirection': 'row',
    'overflow': 'scroll'
  }}>
    {
      tokenCount > 0 ?
          [...Array(tokenCount - 1)].map((x, i) => {

            return (
                <GalleryItem account={account} rapNft={rapNft} tokenId={i + 1} key={i}>
                  Hello world
                </GalleryItem>
            )
    }) : <div></div>}
  </div>

}

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal(config.network);
  const [rapNft, setRapNft] = useState(null);

  useEffect(() => {
    if (!provider) {
      return;
    }
    const defaultProvider = getDefaultProvider(config.infura);
    setRapNft(new Contract(config.address, abis.rapNameNft.abi, defaultProvider))
  }, [provider]);


  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <img alt="cover photo" style={{'marginLeft': 'auto', 'maxWidth': '500px', 'marginRight': 'auto'}} src={"/coverphoto.png"} />
        <div style={{textAlign: 'center', margin: '10px'}}>every web3 rapper needs a web3 name
          <div style={{fontSize: '20px', marginTop: '10px', marginBottom: '20px'}}>fully on-chain svg + metadata
            <br/>
            <br/>
            <a style={{color: 'white', fontSize: '20px'}} href={"https://twitter.com/rap_name_nft"}>Twitter</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style={{color: 'white', fontSize: '20px'}} href={"https://discord.gg/QUqXQ6tq"}>Discord</a>
          </div>
        </div>
        <MintButton provider={provider} />
        <br />
        <hr width={'100%'} />
        <MintLabel provider={provider} rapNft={rapNft} loadWeb3Model={loadWeb3Modal} logoutOfWeb3Model={logoutOfWeb3Modal}/>
        <MintGallery provider={provider} rapNft={rapNft} />
      </Body>
    </div>
  );
}

export default App;
