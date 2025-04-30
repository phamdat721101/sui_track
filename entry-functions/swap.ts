import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  InputViewFunctionData,
  Network,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";

const addLiquidity = async (
  aptos: Aptos,
  swap: AccountAddress,
  deployer: Account,
  token1Addr: AccountAddress,
  token2Addr: AccountAddress
): Promise<string> => {
  const rawTxn = await aptos.transaction.build.simple({
    sender: deployer.accountAddress,
    data: {
      function: `${swap.toString()}::router::add_liquidity_entry`,
      functionArguments: [
        token1Addr,
        token2Addr,
        false,
        200000,
        300000,
        200,
        300,
      ],
    },
  });
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: deployer,
    transaction: rawTxn,
  });
  const response = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });
  console.log("Add liquidity succeed. - ", response.hash);
  return response.hash;
};

const swapAssets = async (
  aptos: Aptos,
  swap: AccountAddress,
  deployer: Account,
  fromToken: AccountAddress,
  toToken: AccountAddress,
  amountIn: number,
  amountOutMin: number,
  recipient: AccountAddress
): Promise<string> => {
  const rawTxn = await aptos.transaction.build.simple({
    sender: deployer.accountAddress.toString(),
    data: {
      function: `${swap.toString()}::router::swap_entry`,
      functionArguments: [
        amountIn,
        amountOutMin,
        fromToken,
        toToken,
        false,
        recipient,
      ],
    },
  });
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: deployer,
    transaction: rawTxn,
  });
  const response = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });
  console.log("Swap succeed. - ", response.hash);
  return response.hash;
};
