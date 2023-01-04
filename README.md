I will make 3 contract for 3 different NFT :

1. A basic NFT using ERC721 standard
2. Random IPFS hosted NFT
3. Dynamic SVG NFT

## Summary of the random IPFS NFT Part





## Commands for Dependencies

```
yarn add --dev hardhat

yarn hardhat

yarn add --dev @typechain/ethers-v5 @typechain/hardhat @types/chai @types/node @types/mocha ts-node typechain typescript

yarn add --dev @openzeppelin/contracts

yarn add --dev @chainlink/contracts

 yarn add --dev @pinata/sdk

 yarn add --dev path

 yarn hardhat deploy --tags randomipfs,mocks
```

## Some line comments

```
module.exports = async ({getNamedAccounts, deployments}){}
```

In a Hardhat project, the getNamedAccounts and deployments functions are provided to the deployment script as part of the runtime environment.

Hardhat is a development environment for Ethereum that provides a set of tools and libraries for building, testing, and deploying Ethereum smart contracts. When you run a deployment script in a Hardhat project, Hardhat sets up a runtime environment that provides a number of utility functions and objects that are useful for working with Ethereum contracts.

The getNamedAccounts property is a function that can be used to get the Ethereum addresses of named accounts that are defined in the project's Hardhat configuration. The deployments property is an object that contains functions that can be used to deploy contract artifacts to the Ethereum blockchain.

This line of code is typically used at the beginning of a deployment script in a Hardhat project to set up the necessary dependencies for the script. The function that is exported will be called when the deployment script is run, and it will have access to the getNamedAccounts and deployments functions through the object that is passed as an argument.

```
const basicNft = await deploy("BasicNFT", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
```

In this code snippet, the deploy function is being used to deploy a contract to the Ethereum blockchain and call its constructor with the specified arguments. The deploy function is part of the deployments object in a Hardhat project, and it takes two parameters: the name of the contract to be deployed, and an array of arguments to be passed to the contract's constructor.

The code passes the following parameters to the deploy function:

"BasicNFT": This is the name of the contract to be deployed.

{ from: deployer, args: args, log: true, waitConfirmations: }: This is an object that contains additional options for the deployment. The from property specifies the Ethereum address of the account that will be used to deploy the contract, the args property is an array of arguments that will be passed to the contract's constructor, the log property specifies whether deployment logs should be printed to the console, and the waitConfirmations property specifies how many block confirmations to wait for before returning the deployed contract's address.

The deploy function returns a promise that is resolved with the deployed contract's address once the deployment is complete. This promise is being awaited using the await keyword, so the code will pause until the deployment is complete and the contract's address is returned.
