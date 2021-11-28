FILES="asset-manifest.json	coverphoto.png		logo192.png \
  banner.png		favicon.ico		logo512.png		robots.txt \
  index.html		manifest.json"

for i in $(echo $FILES);
do
  rm -rf $i;
done

cp ../rap-name-nft-contracts/artifacts/contracts/RapNameNFTv2.sol/RapNameNFTv2.json rap-name-nft/packages/contracts/src/abis
cp -r rap-name-nft/packages/react-app/build/* .;
