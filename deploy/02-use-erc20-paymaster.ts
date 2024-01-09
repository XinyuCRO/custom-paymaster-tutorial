import { Provider, utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv";
dotenv.config();

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const EMPTY_WALLET_PRIVATE_KEY = process.env.EMPTY_WALLET_PRIVATE_KEY || "";
const ERC20_TOKEN_ADDRESS = process.env.ERC20_TOKEN_ADDRESS || "";
const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS || "";


function getToken(hre: HardhatRuntimeEnvironment, wallet: Wallet) {
  const artifact = hre.artifacts.readArtifactSync("USDC");
  return new ethers.Contract(ERC20_TOKEN_ADDRESS!, artifact.abi, wallet);
}

export default async function (hre: HardhatRuntimeEnvironment) {
  if (!EMPTY_WALLET_PRIVATE_KEY || !PAYMASTER_ADDRESS || !ERC20_TOKEN_ADDRESS) {
    throw new Error("Please ensure all EMPTY_WALLET_PRIVATE_KEY, PAYMASTER_ADDRESS & ERC20_TOKEN_ADDRESS in .env has specified with correct value");
  }

  const provider = new Provider((hre.userConfig.networks?.cronosZkEVMTestnet as any).url);
  const emptyWallet = new Wallet(EMPTY_WALLET_PRIVATE_KEY!, provider);

  console.log("Empty wallet address: ", emptyWallet.address);
  

  // const paymasterWallet = new Wallet(PAYMASTER_ADDRESS, provider);
  // Obviously this step is not required, but it is here purely to demonstrate that indeed the wallet has no ether.
  const ethBalance = await emptyWallet.getBalance();
  if (!ethBalance.eq(0)) {
    throw new Error("The wallet is not empty!");
  }

  console.log("Empty wallet don't have any CRO tokens on L2");
  

  console.log(
    `ERC20 token balance of the empty wallet before transfer: ${ethers.utils.formatEther(await emptyWallet.getBalance(
      ERC20_TOKEN_ADDRESS,
    ))} USDC`,
  );

  let paymasterBalance = await provider.getBalance(PAYMASTER_ADDRESS);
  console.log(`Paymaster CRO balance is ${ethers.utils.formatEther(paymasterBalance).toString()} CRO`);

  const erc20 = getToken(hre, emptyWallet);

  const gasPrice = await provider.getGasPrice();

  // Encoding the "ApprovalBased" paymaster flow's input
  const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: "ApprovalBased",
    token: ERC20_TOKEN_ADDRESS,
    // set minimalAllowance as we defined in the paymaster contract
    minimalAllowance: ethers.BigNumber.from(1),
    // empty bytes as testnet paymaster does not use innerInput
    innerInput: new Uint8Array(),
  });

  const TRANSFER_AMOUNT = "1";

  // Estimate gas fee for transfer transaction
  const gasLimit = await erc20.estimateGas.transfer(emptyWallet.address, TRANSFER_AMOUNT, {
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams: paymasterParams,
    },
  });

  const fee = gasPrice.mul(gasLimit.toString());
  console.log("Transaction fee estimation is :>> ", ethers.utils.formatEther(fee).toString(), "CRO");

  console.log(`Transfer ${ethers.utils.formatUnits(TRANSFER_AMOUNT, "wei")} USDC to empty wallet itself via paymaster...`);
  await (
    await erc20.transfer(emptyWallet.address, TRANSFER_AMOUNT, {
      // paymaster info
      customData: {
        paymasterParams: paymasterParams,
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      },
    })
  ).wait();

  console.log(
    `Paymaster ERC20 token balance is now ${await erc20.balanceOf(
      PAYMASTER_ADDRESS,
    )} USDC`,
  );

  paymasterBalance = await provider.getBalance(PAYMASTER_ADDRESS);
  console.log(`Paymaster CRO balance is now ${ethers.utils.formatEther(paymasterBalance).toString()} CRO`);

  console.log(
    `ERC20 token balance of the empty wallet after transfer: ${ethers.utils.formatEther(await emptyWallet.getBalance(
      ERC20_TOKEN_ADDRESS,
    ))} USDC`,
  );
}
