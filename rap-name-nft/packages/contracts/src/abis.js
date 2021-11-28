import erc20Abi from "./abis/erc20.json";
import ownableAbi from "./abis/ownable.json";
import rapNameNftAbi from "./abis/RapNameNFT.json";
import rapNameNftv2Abi from "./abis/RapNameNFTv2.json";

const abis = {
  erc20: erc20Abi,
  rapNameNft: rapNameNftAbi,
  rapNameNftv2: rapNameNftv2Abi,
  ownable: ownableAbi,
};

export default abis;
