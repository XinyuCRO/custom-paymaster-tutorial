import { Provider, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { setEnvValue } from "./utils";

import dotenv from "dotenv";
dotenv.config();

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const ERC20_TOKEN_ADDRESS = "0x7AD233FC8BC8Eb25b6CE7c0055b3e4226c3320d5";
const ORACLE_CONTRACT_ADDRESS = process.env.ORACLE_CONTRACT_ADDRESS || "";

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = new Provider((hre.userConfig.networks?.cronosZkEVMTestnet as any).url);

  if (!WALLET_PRIVATE_KEY) {
    throw new Error("Please put WALLET_PRIVATE_KEY in .env to specify the private key of the wallet that will deploy the contracts");
  }

  if (!ORACLE_CONTRACT_ADDRESS) {
    throw new Error("Please put ORACLE_CONTRACT_ADDRESS in .env to specify the address of the oracle contract, or use the deploy oracle script to deploy a new one")
  }

  // The wallet that will deploy the token and the paymaster
  // It is assumed that this wallet already has sufficient funds on zkSync
  let wallet = new Wallet(WALLET_PRIVATE_KEY);
  wallet = wallet.connect(provider);
  console.log(`Imported wallet's address: ${wallet.address}`);
  let balance = await provider.getBalance(wallet.address)
  console.log("Imported wallet's balance on l2: ", ethers.utils.formatEther(balance), "ETH");

  // The wallet that will receive ERC20 tokens
  const emptyWallet = Wallet.createRandom();
  console.log(`Empty wallet's address: ${emptyWallet.address}`);
  console.log(`Empty wallet's private key: ${emptyWallet.privateKey}`);

  const deployer = new Deployer(hre, wallet);

  // Deploying the paymaster
  const paymasterArtifact = await deployer.loadArtifact("MyPaymaster");
  const paymaster = await deployer.deploy(paymasterArtifact, [ERC20_TOKEN_ADDRESS, ORACLE_CONTRACT_ADDRESS]);
  console.log(`Paymaster address: ${paymaster.address}`);

  console.log(`Updating .env file`);
  setEnvValue("EMPTY_WALLET_PRIVATE_KEY", emptyWallet.privateKey);
  setEnvValue("PAYMASTER_ADDRESS", paymaster.address);
}
