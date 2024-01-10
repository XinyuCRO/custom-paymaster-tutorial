import { utils, Provider, Wallet, Contract, ContractFactory } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { setEnvValue } from "./utils";

import dotenv from "dotenv";
dotenv.config();

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const EMPTY_WALLET_PRIVATE_KEY = process.env.EMPTY_WALLET_PRIVATE_KEY || "";
const ERC20_TOKEN_ADDRESS = process.env.ERC20_TOKEN_ADDRESS || "";
const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS || "";

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = new Provider((hre.userConfig.networks?.cronosZkEVMTestnet as any).url);

  if (!WALLET_PRIVATE_KEY) {
    throw new Error("Please put WALLET_PRIVATE_KEY in .env to specify the private key of the wallet that will deploy the contracts");
  }
  
  if (!EMPTY_WALLET_PRIVATE_KEY || !ERC20_TOKEN_ADDRESS || !PAYMASTER_ADDRESS) {
    throw new Error("Please put EMPTY_WALLET_PRIVATE_KEY, ERC20_TOKEN_ADDRESS and PAYMASTER_ADDRESS in .env to specify the address of the empty wallet, the address of the ERC20 token and the address of the paymaster");
  }

  let wallet = new Wallet(WALLET_PRIVATE_KEY);
  wallet = wallet.connect(provider);
  console.log(`Imported wallet's address: ${wallet.address}`);
  let balance = await provider.getBalance(wallet.address)
  console.log("Imported wallet's balance on l2: ", ethers.utils.formatEther(balance), "ETH");

  // The wallet that will receive ERC20 tokens
  const emptyWallet = new Wallet(EMPTY_WALLET_PRIVATE_KEY);
  console.log(`Empty wallet's address: ${emptyWallet.address}`);
  console.log(`Empty wallet's private key: ${emptyWallet.privateKey}`);

  const deployer = new Deployer(hre, wallet);

  const erc20Artifact = await deployer.loadArtifact("USDC");
  const contractFactory = ContractFactory.fromSolidity(erc20Artifact, wallet);
  const usdc = await contractFactory.attach(ERC20_TOKEN_ADDRESS);

  console.log("funding empty wallet with USDC...");
  let tx = await usdc.transfer(emptyWallet.address, ethers.utils.parseEther("1"));
  await tx.wait();
  console.log("EmptyWallet USDC balance: ", ethers.utils.formatEther(await usdc.balanceOf(emptyWallet.address)), "USDC");

  console.log("funding paymaster with CRO...");
  tx = await wallet.transfer({
    to: PAYMASTER_ADDRESS,
    amount: ethers.utils.parseEther("1"),
  });
  await tx.wait()
  console.log("paymaster CRO balance: ", ethers.utils.formatEther(await provider.getBalance(PAYMASTER_ADDRESS)), "CRO");
}
