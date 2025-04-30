"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/Card";
import { Slider } from "../../ui/slider";
import { Input } from "../../ui/Input";
import LiquidityPositionSelector from "./PositionSelector";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  aptosClient,
  getRemoveLiquidParams,
  TESTNET_SWAP_CONTRACT_ADDRESS,
} from "../../warpgate/index";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk";

// Mock liquidity positions
const liquidityPositions = [
  {
    id: "sui-usdc",
    name: "SUI-USDC LP",
    symbol: "SUI-USDC",
    balance: "0.5",
    token1: {
      symbol: "SUI",
      icon: "/chains/sui.svg",
      amount: "100",
      value: 50, // in USD
    },
    token2: {
      symbol: "USDC",
      icon: "/usdc-logo.svg",
      amount: "0.025",
      value: 50, // in USD
    },
    totalValue: 100, // in USD
    share: "0.02%",
    icon: "",
  },
];

export default function RemoveLiquidityUI() {
  const [selectedPosition, setSelectedPosition] = useState(
    liquidityPositions[0]
  );
  const [percentage, setPercentage] = useState(50);
  const [lpAmount, setLpAmount] = useState(
    ((Number(selectedPosition.balance) * percentage) / 100).toFixed(6)
  );
  const { account, signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();

  const removeLiquid = async () => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    const removeParams = await getRemoveLiquidParams(
      convertAmountFromHumanReadableToOnChain(+lpAmount, 8).toString(),
      "0",
      "0",
      "0x18394ec9e2a191e2470612a57547624b12254c9fbb552acaff6750237491d644::MAHA::MAHA",
      "0x1::aptos_coin::AptosCoin"
    );

    if (!removeParams) return;

    const response = await signAndSubmitTransaction({
      sender: account.address,
      data: {
        function: `${TESTNET_SWAP_CONTRACT_ADDRESS}::router::remove_liquidity`,
        typeArguments: [...removeParams.typeArguments],
        functionArguments: [...removeParams.functionArguments],
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
          title: "Successfully removed liquidity!",
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

  // Update LP amount when percentage changes
  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    setLpAmount(((Number(selectedPosition.balance) * value) / 100).toFixed(6));
  };

  // Update percentage when LP amount changes
  const handleLpAmountChange = (value: string) => {
    setLpAmount(value);
    if (value && !isNaN(Number(value))) {
      const newPercentage = Math.min(
        100,
        (Number(value) / Number(selectedPosition.balance)) * 100
      );
      setPercentage(newPercentage);
    } else {
      setPercentage(0);
    }
  };

  // Calculate amounts to receive based on percentage
  const token1Amount = (
    (Number(selectedPosition.token1.amount) * percentage) /
    100
  ).toFixed(6);
  const token2Amount = (
    (Number(selectedPosition.token2.amount) * percentage) /
    100
  ).toFixed(6);

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-6 pb-0">
        <div className="space-y-4 sm:space-y-6">
          {/* Liquidity Position Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Liquidity Position</span>
              <span className="text-sm text-muted-foreground">
                Balance: {selectedPosition.balance} LP
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 bg-muted/50 rounded-xl">
              <LiquidityPositionSelector
                selectedPosition={selectedPosition}
                onSelectPosition={setSelectedPosition}
                positions={liquidityPositions}
              />
              <Input
                type="number"
                value={lpAmount}
                onChange={(e) => handleLpAmountChange(e.target.value)}
                className="border-0 bg-transparent text-right text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Percentage Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount to Remove</span>
              <span className="text-sm font-medium">
                {percentage.toFixed(2)}%
              </span>
            </div>

            <Slider
              value={[percentage]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={(value) => handlePercentageChange(value[0])}
            />

            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => handlePercentageChange(25)}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => handlePercentageChange(50)}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => handlePercentageChange(75)}
              >
                75%
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => handlePercentageChange(100)}
              >
                Max
              </Button>
            </div>
          </div>

          {/* Tokens to Receive */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="text-sm font-medium mb-2">You Will Receive</div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={selectedPosition.token1.icon || "/placeholder.svg"}
                    alt={selectedPosition.token1.symbol}
                    width={24}
                    height={24}
                  />
                </div>
                <span>
                  {token1Amount} {selectedPosition.token1.symbol}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                $
                {(
                  (Number(token1Amount) * selectedPosition.token1.value) /
                  Number(selectedPosition.token1.amount)
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={selectedPosition.token2.icon || "/placeholder.svg"}
                    alt={selectedPosition.token2.symbol}
                    width={24}
                    height={24}
                  />
                </div>
                <span>
                  {token2Amount} {selectedPosition.token2.symbol}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                $
                {(
                  (Number(token2Amount) * selectedPosition.token2.value) /
                  Number(selectedPosition.token2.amount)
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Remove Liquidity Button */}
          <Button
            className="w-full mt-4 sm:mt-6 h-10 sm:h-12 text-base sm:text-lg"
            size="lg"
            onClick={removeLiquid}
          >
            Remove Liquidity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
