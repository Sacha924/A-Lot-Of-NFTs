//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();

/* Our contract is :
- VRFConsumerBaseV2 because we use fulfillRandomWords (we override this function) and requestRandomWords (inside the requestNft), 
- and ERC721URIStorage --> extension of ERC721 
- and Ownable --> we use the onlyOwner modifier
*/

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
  // People have to pay to mint an nft
  // Instead of just minting any nft, when we mint an NFT we will trigger a chainlink vrf call to get us a random number that will get a random nft, that will be a random dog between 3 dogs
  // How to get this random NFT ? Depending on the random number we will get a different dog breed (if numberFromChainlinkVRF betwwen 0-10 --> Pug, if 10 - 40 ...)
  // We will use the breed to get the ipfs hash of the dog
  // The owner of the contract will be able to withdraw the eth

  // Type Declaration
  enum Breed {
    PUG,
    SHIBA_INU,
    ST_BERNARD
  }
  // chainlink VFR variables
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  uint64 private immutable i_subscriptionId;
  bytes32 private immutable i_gasLane;
  uint32 private immutable i_callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint32 private constant NUM_WORDS = 1;

  // VRF helper
  mapping(uint256 => address) public s_requestIdToSender;

  // NFT Variable
  uint256 public s_tokenCounter;
  uint256 internal constant MAX_CHANCE_VALUE = 100;
  string[] internal s_dogTokenUris;
  uint256 internal immutable i_mintFee;

  // Events
  event NFTRequested(uint256 indexed requestId, address requester);
  event NFTMinted(Breed dogBreed, address minter);

  // Even if the contract inherit from ERC721URIStorage, we write ERC721 in our constructor because ERC721URIStorage is just an extension of the ERC721
  // abstract contract ERC721URIStorage is ERC721
  constructor(address vrfCoordinatorV2, uint64 subscriptionId, bytes32 gasLane, uint256 mintFee, uint32 callbackGasLimit, string[3] memory dogTokenUris) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random Ipfs Nft", "RIN") {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_subscriptionId = subscriptionId;
    i_gasLane = gasLane;
    i_callbackGasLimit = callbackGasLimit;
    s_dogTokenUris = dogTokenUris;
    i_mintFee = mintFee;
  }

  function requestNft() public payable returns (uint256 requestId) {
    //request a random number from chainlink vrf
    //we will use the request id to mint the nft
    if (msg.value < i_mintFee) revert RandomIpfsNft__NeedMoreETHSent();
    requestId = i_vrfCoordinator.requestRandomWords(i_gasLane, i_subscriptionId, REQUEST_CONFIRMATIONS, i_callbackGasLimit, NUM_WORDS);
    s_requestIdToSender[requestId] = msg.sender;
    emit NFTRequested(requestId, msg.sender);
  }

  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    address nftOwner = s_requestIdToSender[requestId];
    uint256 newTokenId = s_tokenCounter;
    s_tokenCounter++;
    // What does this token look like?
    uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE; // Allows us to get a number between 0 - 99
    Breed dogBreed = getBreedFromModdedRng(moddedRng);
    _safeMint(nftOwner, newTokenId);
    _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);
    emit NFTMinted(dogBreed, nftOwner);
  }

  function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    (bool success, ) = payable(msg.sender).call{ value: balance }("");
    if (!success) revert RandomIpfsNft__TransferFailed();
  }

  function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
    uint256 cumulativeSum = 0;
    uint256[3] memory chanceArray = getChanceArray();
    for (uint256 i = 0; i < chanceArray.length; i++) {
      // Pug = 0 - 9  (10%)  Shiba-inu = 10 - 39  (30%) St. Bernard = 40 = 99 (60%)
      if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
        return Breed(i);
      }
      cumulativeSum = chanceArray[i];
    }
    revert RandomIpfsNft__RangeOutOfBounds();
  }

  function getChanceArray() public pure returns (uint256[3] memory) {
    return [10, 30, MAX_CHANCE_VALUE];
  }

  function getMintFee() public view returns (uint256) {
    return i_mintFee;
  }

  function getDogTokenUris(uint256 index) public view returns (string memory) {
    return s_dogTokenUris[index];
  }

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }
}
