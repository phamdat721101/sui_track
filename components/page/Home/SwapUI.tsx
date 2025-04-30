"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Slider } from "../../ui/slider";
import { ArrowDownUp, Info, RefreshCw, Settings } from "lucide-react";
import TokenSelector from "./TokenSelector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/Popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import {
  aptosClient,
  getBalance,
  getSdk,
  getSwapParams,
  TESTNET_SWAP_CONTRACT_ADDRESS,
} from "../../warpgate/index";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
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

export default function SwapUI() {
  const { account, signAndSubmitTransaction } = useWallet();
  const { tokens, loading: tokensLoading } = useTokens();
  const { balances, loading: balancesLoading } = useTokenBalances(
    account?.address,
    tokens
  );
  const { prices, loading: pricesLoading } = useTokenPrices(tokens);

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("1");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const enrichedTokens = useMemo(() => {
    return tokens.map((token) => ({
      ...token,
      balance: balances[token.symbol] || "0",
      price: prices[token.symbol] || 0,
    }));
  }, [tokens, balances, prices]);

  const getTokenInfo = async () => {
    const sdk = getSdk();
    const tokenInfo = await sdk.getTokenInfo(
      "0x2d1479ec4dbbe6f45e068fb767e761f05fab2838954e0c6b8ea87e94ea089abb::NIGHTLY::NIGHTLY"
    );
    console.log("Token info:", tokenInfo);

    const poolState = await sdk.fetchPoolState(
      "0x2d1479ec4dbbe6f45e068fb767e761f05fab2838954e0c6b8ea87e94ea089abb::NIGHTLY::NIGHTLY"
    );
    console.log("Pool state:", poolState);
  };

  useEffect(() => {
    if (enrichedTokens.length > 0 && !fromToken) {
      setFromToken(enrichedTokens[0]);
      setToToken(enrichedTokens[1]);
    }

    getTokenInfo();
  }, [enrichedTokens]);

  // Calculate the to amount based on price
  const toAmount =
    fromToken && toToken && fromAmount
      ? (
          (Number.parseFloat(fromAmount) * fromToken.price) /
          toToken.price
        ).toFixed(6)
      : "0";

  // Swap the tokens
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };
  const swapHandler = async () => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    const params = await getSwapParams(
      `${fromAmount}`,
      "0x1::aptos_coin::AptosCoin",
      "MOVE",
      "0x18394ec9e2a191e2470612a57547624b12254c9fbb552acaff6750237491d644::MAHA::MAHA",
      "MAHA"
    );

    if (!params) return;

    const response = await signAndSubmitTransaction({
      sender: account.address,
      data: {
        function: `${TESTNET_SWAP_CONTRACT_ADDRESS}::router::swap_exact_input`,
        typeArguments: [...params.typeArguments],
        functionArguments: [...params.functionArguments],
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
          title: "Successfully swapped!",
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

  // Calculate price impact (mock)
  const priceImpact = "0.05%";

  // Calculate minimum received (mock)
  const minReceived = (
    Number.parseFloat(toAmount) *
    (1 - slippage / 100)
  ).toFixed(6);

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-6 pb-0">
        {/* From Token Section */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">From</span>
            <span className="text-sm text-muted-foreground">
              Balance: {fromToken?.balance || "0"} {fromToken?.symbol || ""}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 p-0 bg-muted/50 rounded-xl">
            <TokenSelector
              selectedToken={fromToken}
              onSelectToken={setFromToken}
              tokens={enrichedTokens.filter((t) => t.id !== toToken?.id)}
            />
            <Input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="border-0 bg-transparent text-right text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="0.0"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="py-3 flex justify-center relative z-10">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background h-10 w-10 sm:h-12 sm:w-12 border-2 shadow-md"
            onClick={handleSwapTokens}
          >
            <ArrowDownUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* To Token Section */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">To</span>
            <span className="text-sm text-muted-foreground">
              Balance: {toToken?.balance || "0"} {toToken?.symbol || ""}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 bg-muted/50 rounded-xl">
            <TokenSelector
              selectedToken={toToken}
              onSelectToken={setToToken}
              tokens={enrichedTokens.filter((t) => t.id !== fromToken?.id)}
            />
            <Input
              type="number"
              value={toAmount}
              readOnly
              className="border-0 bg-transparent text-right text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="0.0"
            />
          </div>
        </div>

        {/* Price and Settings */}
        <div className="mt-2 space-y-1">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              <span>Price</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exchange rate between tokens</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-1">
              <span>
                1 {fromToken?.symbol} ={" "}
                {fromToken && toToken
                  ? (fromToken.price / toToken.price).toFixed(6)
                  : "0"}{" "}
                {toToken?.symbol}
              </span>
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-muted-foreground"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 text-muted-foreground"
                >
                  <Info className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span>{priceImpact}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Minimum Received
                    </span>
                    <span>
                      {minReceived} {toToken?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Slippage Tolerance
                    </span>
                    <span>{slippage}%</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Slippage Settings */}
          {showSettings && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Slippage Tolerance</span>
                <span className="text-sm font-medium">{slippage}%</span>
              </div>
              <Slider
                value={[slippage]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={(value) => setSlippage(value[0])}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => setSlippage(0.1)}
                >
                  0.1%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => setSlippage(0.5)}
                >
                  0.5%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => setSlippage(1.0)}
                >
                  1.0%
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <Button
          className="w-full mt-4 h-10 sm:h-12 text-base sm:text-lg"
          size="lg"
          onClick={swapHandler}
        >
          Swap
        </Button>
      </CardContent>
    </Card>
  );
}
