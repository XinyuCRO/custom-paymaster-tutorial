import { Provider, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { setEnvValue } from "./utils";

import dotenv from "dotenv";
dotenv.config();

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = new Provider((hre.userConfig.networks?.cronosZkEVMTestnet as any).url);

  if (!WALLET_PRIVATE_KEY) {
    throw new Error("Please put WALLET_PRIVATE_KEY in .env to specify the private key of the wallet that will deploy the contracts");
  }

  // The wallet that will deploy the token and the paymaster
  // It is assumed that this wallet already has sufficient funds on zkSync
  let wallet = new Wallet(WALLET_PRIVATE_KEY);
  wallet = wallet.connect(provider);
  console.log(`Deployer's address: ${wallet.address}`);
  let balance = await provider.getBalance(wallet.address)
  console.log("Deployer's balance on l2: ", ethers.utils.formatEther(balance), "CRO");

  const deployer = new Deployer(hre, wallet);

  // Deploying the paymaster
  const DIAOracleArtifact = await deployer.loadArtifact("DIAOracleV2");
  const oracle = await deployer.deploy(DIAOracleArtifact);
  console.log(`Oracle address: ${oracle.address}`);

  console.log(`Updating .env file`);
  setEnvValue("ORACLE_CONTRACT_ADDRESS", oracle.address);
}
