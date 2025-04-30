import {
  Aptos,
  AptosConfig,
  convertAmountFromHumanReadableToOnChain,
  convertAmountFromOnChainToHumanReadable,
  InputEntryFunctionData,
  InputScriptData,
  Network,
} from "@aptos-labs/ts-sdk";
import {
  ChainId,
  Coin,
  Pair,
  Route,
  Trade,
  Router,
  Currency,
  Percent,
  CurrencyAmount,
  DEFAULT_FEE,
} from "warpgate-swap-sdk";
import { TokenSDK } from "warpgate-fun-sdk";

// Enum to track pair states
export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

// Initialize SDK
const sdk = new TokenSDK();
export function getSdk() {
  return sdk;
}

export const TESTNET_SWAP_CONTRACT_ADDRESS =
  "0xb75c5bbb44fcaaf0a0ec1299b890b665ec4fe229d0ef42cbfbaf8b59eda192cc";

// Initialize Aptos client
const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: "https://aptos.testnet.bardock.movementlabs.xyz/v1",
});
const aptos = new Aptos(config);

export function aptosClient() {
  return aptos;
}

// Function to fetch pair reserves from blockchain
async function getPairReserves(tokenA: Currency, tokenB: Currency) {
  try {
    const pairReservesAddress = `${TESTNET_SWAP_CONTRACT_ADDRESS}::swap::TokenPairReserve<${tokenA.address}, ${tokenB.address}>`;

    const resource = await aptos.getAccountResource({
      accountAddress: TESTNET_SWAP_CONTRACT_ADDRESS, // Swap contract address
      resourceType: pairReservesAddress as any,
    });

    if (!resource) {
      return null;
    }

    return {
      reserve_x: (resource as any).reserve_x,
      reserve_y: (resource as any).reserve_y,
    };
  } catch (error) {
    console.error("Error fetching pair reserves:", error);
    return null;
  }
}

export async function getPair(
  tokenA?: Currency,
  tokenB?: Currency
): Promise<[PairState, Pair | null]> {
  if (!tokenA || !tokenB || tokenA.equals(tokenB)) {
    return [PairState.INVALID, null];
  }

  const reserves = await getPairReserves(tokenA, tokenB);

  if (!reserves) {
    return [PairState.NOT_EXISTS, null];
  }

  const [token0, token1] = Pair.sortToken(tokenA, tokenB);

  return [
    PairState.EXISTS,
    new Pair(
      CurrencyAmount.fromRawAmount(token0, reserves.reserve_x),
      CurrencyAmount.fromRawAmount(token1, reserves.reserve_y)
    ),
  ];
}

export async function getSwapParams(
  amount1: string,
  addr1: string,
  symbol1: string,
  addr2: string,
  symbol2: string
) {
  const Move = new Coin(250, addr1, 8, symbol1);

  const token = new Coin(250, addr2, 8, symbol2);

  // Get pair
  const [pairState, pair] = await getPair(token, Move);

  if (pairState === PairState.EXISTS && pair) {
    // Create a route
    const route = new Route([pair], Move, token);

    // Create a trade with 1 Move
    const trade = Trade.exactIn(
      route,
      CurrencyAmount.fromRawAmount(
        Move,
        convertAmountFromHumanReadableToOnChain(+amount1, 8)
      ), // 1 Move
      DEFAULT_FEE // 0.25% fee
    );

    // Execute the swap with 0.5% slippage tolerance
    const swapParams: any = Router.swapCallParameters(trade, {
      allowedSlippage: new Percent("50", "10000"), // 0.5%
    });

    // Log the swap parameters and reserves
    console.log("Swap Parameters:", {
      typeArguments: swapParams?.typeArguments,
      functionArguments: swapParams?.functionArguments,
      function: swapParams?.function,
    });

    return {
      typeArguments: swapParams?.typeArguments,
      functionArguments: swapParams?.functionArguments,
      function: swapParams?.function,
    };
  } else {
    console.log("Pair does not exist on blockchain");
    return null;
  }
}

export async function getPairParams(
  addr1: string,
  symbol1: string,
  addr2: string,
  symbol2: string
) {
  const Move = new Coin(250, addr1, 8, symbol1);

  const token = new Coin(250, addr2, 8, symbol2);

  // Get pair
  const [pairState, pair] = await getPair(token, Move);

  if (pairState === PairState.EXISTS && pair) {
    return {
      reserve0: pair.reserve0.toExact(),
      reserve1: pair.reserve1.toExact(),
      price0: pair.token0Price.toSignificant(6),
      price1: pair.token1Price.toSignificant(6),
    };
  } else {
    console.log("Pair does not exist on blockchain");
    return null;
  }
}

export async function getAddLiquidParams(
  amount1: string,
  amount2: string,
  minAmount1: string,
  minAmount2: string,
  addr1: string,
  addr2: string,
  fee: string
) {
  const amount_1 = convertAmountFromHumanReadableToOnChain(+amount1, 8);
  const amount_2 = convertAmountFromHumanReadableToOnChain(+amount2, 8);

  const addLiquidParams: any = Router.addLiquidityParameters(
    amount_1.toString(),
    amount_2.toString(),
    minAmount1,
    minAmount2,
    addr1,
    addr2,
    fee
  );

  // Log the swap parameters and reserves
  console.log("Add liquid Parameters:", {
    typeArguments: addLiquidParams?.typeArguments,
    functionArguments: addLiquidParams?.functionArguments,
    function: addLiquidParams?.function,
  });

  return {
    typeArguments: addLiquidParams?.typeArguments,
    functionArguments: addLiquidParams?.functionArguments,
    function: addLiquidParams?.function,
  };
}

export async function getRemoveLiquidParams(
  amountLP: string,
  minAmount1: string,
  minAmount2: string,
  addr1: string,
  addr2: string
) {
  const removeLiquidParams: any = Router.removeLiquidityParameters(
    amountLP,
    minAmount1,
    minAmount2,
    addr1,
    addr2
  );
  if (removeLiquidParams) {
    // Log the swap parameters and reserves
    console.log("Remove liquid Parameters:", {
      typeArguments: removeLiquidParams?.typeArguments,
      functionArguments: removeLiquidParams?.functionArguments,
      function: removeLiquidParams?.function,
    });
    return removeLiquidParams;
  }
  console.log("Pair does not exist on blockchain");
  return null;
}

export function estimateLiquidToAdd(
  amount1: string,
  reserve0: string,
  reserve1: string
) {
  const amount_1 = BigInt(
    convertAmountFromHumanReadableToOnChain(+amount1, 8).toFixed(0)
  );
  const reserve_0 = BigInt(
    convertAmountFromHumanReadableToOnChain(+reserve0, 8)
  );
  const reserve_1 = BigInt(
    convertAmountFromHumanReadableToOnChain(+reserve1, 8)
  );

  const amount2 = (amount_1 * reserve_0) / reserve_1;

  const amount_2 = convertAmountFromOnChainToHumanReadable(
    Number(amount2),
    8
  ).toFixed(0);
  return amount_2;
}

// Function to fetch balance from blockchain
export async function getBalance(
  address: string,
  tokenAddress: `${string}::${string}::${string}`
) {
  try {
    const resource = await aptos.getAccountResource({
      accountAddress: address,
      resourceType: tokenAddress,
    });

    if (!resource) {
      return 0;
    }

    const { coin } = resource;
    const balance = convertAmountFromOnChainToHumanReadable(coin.value, 8);

    return balance;
  } catch (error) {
    console.error("Error fetching pair reserves:", error);
    return 0;
  }
}

// Example usage
async function main() {
  // Define tokens
  const Move = new Coin(250, "0x1::aptos_coin::AptosCoin", 8, "MOVE");

  const Maha = new Coin(
    250,
    "0x18394ec9e2a191e2470612a57547624b12254c9fbb552acaff6750237491d644::MAHA::MAHA",
    8,
    "MAHA"
  );

  // Get pair
  const [pairState, pair] = await getPair(Maha, Move);

  if (pairState === PairState.EXISTS && pair) {
    // Create a route
    const route = new Route([pair], Move, Maha);

    // Create a trade with 1 Move
    const trade = Trade.exactIn(
      route,
      CurrencyAmount.fromRawAmount(Move, "100000000"), // 1 Move
      DEFAULT_FEE // 0.25% fee
    );

    // Execute the swap with 0.5% slippage tolerance
    const swapParams: any = Router.swapCallParameters(trade, {
      allowedSlippage: new Percent("50", "10000"), // 0.5%
    });

    // Log the swap parameters and reserves
    console.log("Swap Parameters:", {
      typeArguments: swapParams?.typeArguments,
      functionArguments: swapParams?.functionArguments,
      function: swapParams?.function,
    });

    console.log("Pair Reserves:", {
      reserve0: pair.reserve0.toExact(),
      reserve1: pair.reserve1.toExact(),
      price0: pair.token0Price.toSignificant(6),
      price1: pair.token1Price.toSignificant(6),
    });

    const amount1 = "1";
    const reserve0 = pair.reserve0.toFixed();
    const reserve1 = pair.reserve1.toFixed();
    const amount2 = estimateLiquidToAdd(amount1, reserve0, reserve1);

    const addLiquidParams = Router.addLiquidityParameters(
      amount1.toString(),
      amount2.toString(),
      "0",
      "0",
      "0x1::aptos_coin::AptosCoin",
      "0x18394ec9e2a191e2470612a57547624b12254c9fbb552acaff6750237491d644::MAHA::MAHA",
      "9975"
    );
    console.log("Liquid params: ", addLiquidParams);
  } else {
    console.log("Pair does not exist on blockchain");
  }
}

// main().catch(console.error);
