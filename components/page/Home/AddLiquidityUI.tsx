"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Plus, Info } from "lucide-react";
import TokenSelector from "./TokenSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  aptosClient,
  estimateLiquidToAdd,
  getAddLiquidParams,
  getPairParams,
  TESTNET_SWAP_CONTRACT_ADDRESS,
} from "../../warpgate/index";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useTokens } from "@/hooks/useTokens";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useTokenPrices } from "@/hooks/useTokenPrices";

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  price: number;
  icon: string;
  address: string;
}

export default function AddLiquidityUI() {
  const { account, signAndSubmitTransaction } = useWallet();
  const { tokens, loading: tokensLoading } = useTokens();
  const { balances, loading: balancesLoading } = useTokenBalances(
    account?.address,
    tokens
  );
  const { prices, loading: pricesLoading } = useTokenPrices(tokens);

  const [token1, setToken1] = useState<Token | null>(null);
  const [token2, setToken2] = useState<Token | null>(null);
  const [amount1, setAmount1] = useState<string | undefined>("1");
  const [amount2, setAmount2] = useState<string | undefined>();
  const { toast } = useToast();

  const enrichedTokens = useMemo(() => {
    return tokens.map((token) => ({
      ...token,
      balance: balances[token.symbol] || "0",
      price: prices[token.symbol] || 0,
    }));
  }, [tokens, balances, prices]);

  useEffect(() => {
    if (enrichedTokens.length > 0 && !token1) {
      setToken1(enrichedTokens[0]);
      setToken2(enrichedTokens[1]);
    }
  }, [enrichedTokens]);

  const addLiquid = async () => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    const params = await getPairParams(
      "0x1::aptos_coin::AptosCoin",
      "MOVE",
      "0x18394ec9e2a191e2470612a57547624b12254c9fbb552acaff6750237491d644::MAHA::MAHA",
      "MAHA"
    );

    if (!params) return;

    const amount2 = estimateLiquidToAdd(
      `${amount1}`,
      params.reserve0,
      params.reserve1
    );

    const addParams = await getAddLiquidParams(
      `${amount1}`,
      `${amount2}`,
      "0",
      "0",
      "0x1::aptos_coin::AptosCoin",
      "0x18394ec9e2a191e2470612a57547624b12254c9fbb552acaff6750237491d644::MAHA::MAHA",
      "9975"
    );

    if (!addParams) return;

    const response = await signAndSubmitTransaction({
      sender: account.address,
      data: {
        function: `${TESTNET_SWAP_CONTRACT_ADDRESS}::router::add_liquidity`,
        typeArguments: [...addParams.typeArguments],
        functionArguments: [...addParams.functionArguments],
      },
    });

    if (response) {
      const client = aptosClient();
      const txResult = await client.waitForTransaction({
        transactionHash: response.hash,
        options: {
          checkSuccess: true,
        },
      });

      txResult.success &&
        toast({
          title: "Successfully added liquidity!",
          description: (
            <Link
              target="_blank"
              href={`https://explorer.movementnetwork.xyz/txn/${txResult.hash}?network=bardock+testnet`}
            >
              Hash: {txResult.hash}
            </Link>
          ),
        });
    }
  };

  // Calculate the second amount based on price ratio
  const calculateAmount2 = (value: string) => {
    if (!value || isNaN(Number(value))) {
      setAmount1(value);
      setAmount2("");
      return;
    }

    setAmount1(value);

    if (!token1 || !token2) return;
    const calculatedAmount = (
      (Number(value) * token1.price) /
      token2.price
    ).toFixed(6);
    setAmount2(calculatedAmount);
  };

  // Calculate the first amount based on price ratio
  const calculateAmount1 = (value: string) => {
    if (!value || isNaN(Number(value))) {
      setAmount2(value);
      setAmount1("");
      return;
    }

    setAmount2(value);

    if (!token1 || !token2) return;
    const calculatedAmount = (
      (Number(value) * token2.price) /
      token1.price
    ).toFixed(6);
    setAmount1(calculatedAmount);
  };

  // Calculate share of pool (mock)
  const poolShare = "0.02%";

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-6 pb-0">
        {/* First Token Input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">First Token</span>
            <span className="text-sm text-muted-foreground">
              Balance: {token1?.balance || "0"} {token1?.symbol || ""}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 p-0 bg-muted/50 rounded-xl">
            <TokenSelector
              selectedToken={token1}
              onSelectToken={setToken1}
              tokens={tokens.filter((t) => t.id !== token2?.id)}
            />
            <Input
              type="number"
              value={amount1}
              onChange={(e) => calculateAmount2(e.target.value)}
              className="border-0 bg-transparent text-right text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="0.0"
            />
          </div>
        </div>

        {/* Plus Icon */}
        <div className="py-1.5 flex justify-center">
          <div className="bg-muted rounded-full p-2">
            <Plus className="h-4 w-4" />
          </div>
        </div>

        {/* Second Token Input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Second Token</span>
            <span className="text-sm text-muted-foreground">
              Balance: {token2?.balance} {token2?.symbol}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 p-0 bg-muted/50 rounded-xl">
            <TokenSelector
              selectedToken={token2}
              onSelectToken={setToken2}
              tokens={tokens.filter((t) => t.id !== token1?.id)}
            />
            <Input
              type="number"
              value={amount2}
              onChange={(e) => calculateAmount1(e.target.value)}
              className="border-0 bg-transparent text-right text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="0.0"
            />
          </div>
        </div>

        {/* Price and Pool Information */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-2 mt-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              <span>Price Ratio</span>
            </div>
            <span>
              1 {token1?.symbol} ={" "}
              {token1 && token2
                ? (token1.price / token2.price).toFixed(6)
                : "0"}{" "}
              {token2?.symbol}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              <span>Share of Pool</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your share of the total liquidity pool</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span>{poolShare}</span>
          </div>
        </div>

        {/* Add Liquidity Button */}
        <Button
          className="w-full mt-4 sm:mt-6 h-10 sm:h-12 text-base sm:text-lg"
          size="lg"
          onClick={addLiquid}
        >
          Add Liquidity
        </Button>
      </CardContent>
    </Card>
  );
}
