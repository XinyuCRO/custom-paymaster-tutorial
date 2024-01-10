import { Provider, Wallet, ContractFactory } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

import dotenv from "dotenv";
dotenv.config();

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const ORACLE_CONTRACT_ADDRESS = process.env.ORACLE_CONTRACT_ADDRESS || "";

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
  
  const artifact = await deployer.loadArtifact("DIAOracleV2");
  const contractFactory = ContractFactory.fromSolidity(artifact, wallet);
  const oracle = await contractFactory.attach(ORACLE_CONTRACT_ADDRESS);

  const timeStamp = Math.floor(Date.now() / 1000);


  const KEY = "CRO/USD";

  // CRO/USD, 0.1, 
  let tx = await oracle.setValue(KEY, 10000000, timeStamp);

  tx.wait()

  const priceStruct = await oracle.getValue(KEY)
  const price = priceStruct[0].toNumber() / 100000000
  const timestamp = priceStruct[1].toNumber()

  console.log("CRO price: ", price, "USD")
  console.log("Update timestamp:", timestamp)
}
