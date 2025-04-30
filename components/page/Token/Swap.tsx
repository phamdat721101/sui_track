"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRightLeftIcon, ArrowUp, Wallet } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { TokenInfo, TokenInfoSui, TokenMoveFunInfo } from "../../../types/interface";
import { isMovefunTokenInfo, isTokenInfo } from "../../../types/helper";
import {
  Coin,
  ChainId,
  Pair,
  Route,
  Trade,
  TradeType,
  Percent,
  Router,
  CurrencyAmount,
  Currency,
  DEFAULT_FEE,
  SWAP_ADDRESS,
} from "warpgate-swap-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { 
  aptosClient,
  getPair,
  getSwapParams,
  PairState,
} from "../../warpgate/index";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface TokenData {
  address: string;
  symbol: string;
  name: string;
  logo: string;
  amount: string;
  quickAmounts: number[];
}

interface SwapProps {
  token?: TokenInfo | TokenInfoSui | TokenMoveFunInfo | null;
}

export default function TokenSwap({ token }: SwapProps) {
  const [activeTab, setActiveTab] = useState<string | null>("buy");
  const [slippage, setSlippage] = useState("5");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;
    if (isTokenInfo(token)) {
      const newTokenData: TokenData = {
        address: token.mintAddr,
        symbol: token.tickerSymbol,
        name: token.name,
        logo: token.image,
        amount: "0",
        quickAmounts: [10, 20, 25, 50, 75, 100],
      };
      setSelectedToken(newTokenData);
    }
    if (isMovefunTokenInfo(token)) {
      const newTokenData: TokenData = {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        logo: token.image,
        amount: "0",
        quickAmounts: [10, 20, 25, 50, 75, 100],
      };
      setSelectedToken(newTokenData);
    }
    if (!(isTokenInfo(token) || isMovefunTokenInfo(token))) {
      const newTokenData: TokenData = {
        address: token.token_address,
        symbol: token.symbol,
        name: token.name,
        logo: token.token_metadata.iconUrl,
        amount: "0",
        quickAmounts: [10, 20, 25, 50, 75, 100],
      };
      setSelectedToken(newTokenData);
    }
  }, [token]);

  const quickAmounts = [10, 20, 25, 50, 75, 100];

  const slippageOptions = [1, 2, 3, 5, 10];

  const handleTabClick = (tab: string) => {
    setActiveTab((prevTab) => (prevTab === tab ? null : tab));
  };

  const swapHandler = async () => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    const params = await getSwapParams(
      "1",
      "0x1::aptos_coin::AptosCoin",
      "MOVE",
      "0x18394ec9e2a191e2470612a57547624b12254c9fbb552acaff6750237491d644::MAHA::MAHA",
      "MAHA"
    );

    if (!params) return;
    console.log(params);

    const response = await signAndSubmitTransaction({
      sender: account.address,
      data: {
        function: `${SWAP_ADDRESS}::router::swap_exact_input`,
        typeArguments: [
          "0x1::aptos_coin::AptosCoin",
          "0x18394ec9e2a191e2470612a57547624b12254c9fbb552acaff6750237491d644::MAHA::MAHA",
        ],
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

  return (
    <Card className="bg-items text-white border-itemborder">
      <Tabs value={activeTab ?? ""} className="w-full">
        <TabsList className="grid grid-cols-2 w-full h-12 rounded-lg bg-items">
          <TabsTrigger
            value="buy"
            onClick={() => handleTabClick("buy")}
            className={cn(
              "h-full flex items-center gap-2 rounded-lg transition-colors text-gray-50 rounded-none rounded-l-lg",
              activeTab === "buy"
                ? "bg-[#424242] data-[state=active]:bg-green-500/50 data-[state=active]:text-gray-50 data-[state=active]:rounded-none data-[state=active]:rounded-l-lg"
                : "hover:bg-green-500/50 hover:rounded-none hover:rounded-l-lg"
            )}
          >
            <ArrowUp className="w-4 h-4 text-[#b4e85b]" />
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            onClick={() => handleTabClick("sell")}
            className={cn(
              "h-full flex items-center gap-2 rounded-lg transition-colors text-gray-50 rounded-none rounded-r-lg",
              activeTab === "sell"
                ? "bg-[#422424] data-[state=active]:bg-red-500/50 data-[state=active]:text-gray-50 data-[state=active]:rounded-none data-[state=active]:rounded-r-lg"
                : "hover:bg-red-500/50 hover:rounded-none hover:rounded-r-lg"
            )}
          >
            <ArrowDown className="w-4 h-4 text-[#e85b5b]" />
            Sell
          </TabsTrigger>
        </TabsList>
        <TabsContent key="buy" value="buy">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out p-2.5 space-y-3",
              activeTab
                ? "opacity-100 max-h-[600px]"
                : "opacity-0 max-h-0 overflow-hidden"
            )}
          >
            <div className="rounded-lg border border-itemborder">
              <div className="p-2 flex items-center gap-2">
                <img src="/movement-mark.svg" alt="MOVE" className="w-6 h-6" />
                <span className="font-bold">MOV</span>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-0 bg-transparent border-none text-right text-lg font-bold"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-6 rounded-b-lg bg-[#1a3c78]">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    className="h-full p-0 bg-[#1a3c78] hover:bg-blue-800 hover:text-gray-50 border-none text-xs rounded-none first:rounded-bl-lg last:rounded-br-lg"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    {quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-itemborder">
              <div className="p-2 flex items-center gap-2">
                <span className="w-full text-sm">Slippage %</span>
                <Input
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-full h-8 p-0 bg-transparent border-none text-right text-lg font-bold"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-5">
                {slippageOptions.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className={cn(
                      "h-full p-0 bg-[#1a3c78] hover:bg-blue-800 hover:text-gray-50 border-none text-xs rounded-none first:rounded-bl-lg last:rounded-br-lg",
                      slippage === option.toString() && "bg-blue-800"
                    )}
                    onClick={() => setSlippage(option.toString())}
                  >
                    {option}%
                  </Button>
                ))}
              </div>
            </div>

            {connected ? (
              <Button
                onClick={() => swapHandler()}
                className="w-full h-10 text-sm font-semibold bg-transparent border border-bluesky text-bluesky hover:bg-blue-500 hover:text-white"
              >
                <ArrowRightLeftIcon className="w-5 h-5 mr-2" />
                SWAP
              </Button>
            ) : (
              <Button className="w-full h-10 text-sm font-semibold bg-transparent border border-bluesky text-bluesky hover:bg-blue-500 hover:text-white">
                <Wallet className="w-5 h-5 mr-2" />
                CONNECT WALLET
              </Button>
            )}

            <div className="text-center text-xs text-gray-400">
              <div className="flex justify-between items-center">
                <span>You receive min:</span>
                <span className="text-white">
                  {selectedToken?.amount} {selectedToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Platform fee:</span>
                <span className="text-white">0.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Priority fee:</span>
                <span className="text-white">0.002 MOV</span>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent key="sell" value="sell">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out p-2.5 space-y-3",
              activeTab
                ? "opacity-100 max-h-[600px]"
                : "opacity-0 max-h-0 overflow-hidden"
            )}
          >
            <div className="rounded-lg border border-itemborder">
              <div className="p-2 flex items-center gap-2">
                <img
                  src={selectedToken?.logo}
                  alt={selectedToken?.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-bold">{selectedToken?.symbol}</span>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-0 bg-transparent border-none text-right text-lg font-bold"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-6 rounded-b-lg bg-[#1a3c78]">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    className="h-full p-0 bg-[#1a3c78] hover:bg-blue-800 hover:text-gray-50 border-none text-xs rounded-none first:rounded-bl-lg last:rounded-br-lg"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    {quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-itemborder">
              <div className="p-2 flex items-center gap-2">
                <span className="w-full text-sm">Slippage %</span>
                <Input
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-full h-8 p-0 bg-transparent border-none text-right text-lg font-bold"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-5">
                {slippageOptions.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className={cn(
                      "h-full p-0 bg-[#1a3c78] hover:bg-blue-800 hover:text-gray-50 border-none text-xs rounded-none first:rounded-bl-lg last:rounded-br-lg",
                      slippage === option.toString() && "bg-blue-800"
                    )}
                    onClick={() => setSlippage(option.toString())}
                  >
                    {option}%
                  </Button>
                ))}
              </div>
            </div>

            {connected ? (
              <Button className="w-full h-10 text-sm font-semibold bg-transparent border border-bluesky text-bluesky hover:bg-blue-500 hover:text-white">
                <ArrowRightLeftIcon className="w-5 h-5 mr-2" />
                SWAP
              </Button>
            ) : (
              <Button className="w-full h-10 text-sm font-semibold bg-transparent border border-bluesky text-bluesky hover:bg-blue-500 hover:text-white">
                <Wallet className="w-5 h-5 mr-2" />
                CONNECT WALLET
              </Button>
            )}

            <div className="text-center text-xs text-gray-400">
              <div className="flex justify-between items-center">
                <span>You receive min:</span>
                <span className="text-white">{selectedToken?.amount} MOV</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Platform fee:</span>
                <span className="text-white">0.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Priority fee:</span>
                <span className="text-white">0.002 MOV</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
