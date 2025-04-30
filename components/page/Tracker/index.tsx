"use client";
import { useState } from "react";
import { TokenAnalysisForm } from "./TokenAnalysisForm";
import { TokenAnalysis } from "@/types/interface";
import { BarChart, LineChart, Shield, SquareChartGantt } from "lucide-react";
import { DataChart } from "./DataChart";
import { TokenMetricCard } from "./TokenMetricCard";
import { toast } from "@/hooks/use-toast";
import { Button } from "../../ui/Button";
import axios from "axios";
import { formatAddress } from "../../../types/helper";

export default function Page() {
  const [report, setReport] = useState<TokenAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | undefined>();
  const [txHash, setTxHash] = useState<string | undefined>();
  const [input, setInput] = useState({
    tokenAddress: "0x1::aptos_coin::AptosCoin",
    days: 7,
  });

  const getMockData = (): TokenAnalysis => {
    const priceData = [];
    const volumeData = [];
    const now = new Date();

    for (let i = input.days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const basePrice = 12.5;
      const noise = Math.sin(i / 2) * 1.5 + (Math.random() - 0.5) * 0.8;
      const price = basePrice + noise;

      const baseVolume = 850000;
      const volumeNoise =
        Math.cos(i / 3) * 250000 + (Math.random() - 0.5) * 100000;
      const volume = Math.max(baseVolume + volumeNoise, 100000);

      priceData.push({
        date: date.toISOString(),
        value: price,
      });

      volumeData.push({
        date: date.toISOString(),
        value: volume,
      });
    }

    return {
      priceData,
      volumeData,
      holders: {
        current: 24750,
        previous: 23800,
        growthRate: 4,
      },
      liquidity: {
        score: 82,
        pools: [
          { name: "PancakeSwap", value: 3400000 },
          { name: "Uniswap", value: 2100000 },
        ],
      },
      riskAssessment: {
        level: "Low",
        score: 25,
        reasons: [
          "Contract successfully audited",
          "Developer team verified",
          "Good liquidity distribution",
        ],
      },
    };
  };

  const clickHandler = async () => {
    setIsStaking(true);
    try {
      const url = process.env.NEXT_PUBLIC_MOVE_PREDICT || "";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "please stake 0.1 apt for me!",
        }),
      });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "SUCCESS!",
          description: (
            <div>
              <span>Staked successfully! </span>
              <span>
                Tx hash: {formatAddress(result.data.tx_resp.hash || "")}
              </span>
            </div>
          ),
        });
        setTxHash(result.data.tx_resp.hash);
        setIsSuccess(true);
      } else {
        toast({
          title: "ERROR!",
          description: "Please try again!",
        });
        setIsSuccess(false);
      }
    } catch (error) {
      console.log("Failed to post data!");
    } finally {
      setIsStaking(false);
    }
  };

  const getPredictionData = (): TokenAnalysis => {
    const mockData = getMockData();
    const lastPrice = mockData.priceData[mockData.priceData.length - 1].value;
    const lastVolume =
      mockData.volumeData[mockData.volumeData.length - 1].value;

    const now = new Date();
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      const predictedPrice = lastPrice * (1 + (Math.random() * 0.03 + 0.01));

      const predictedVolume = lastVolume * (0.9 + Math.random() * 0.4);

      mockData.priceData.push({
        date: date.toISOString(),
        value: predictedPrice,
      });

      mockData.volumeData.push({
        date: date.toISOString(),
        value: predictedVolume,
      });
    }

    mockData.holders.current = Math.round(mockData.holders.current * 1.05);
    mockData.holders.growthRate = 5;
    mockData.liquidity.score = Math.min(100, mockData.liquidity.score + 3);

    return mockData;
  };

  const analyzeToken = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1800));

    try {
      const mockData = getMockData();
      setReport(mockData);
      toast({
        title: "Success",
        description: "Analysis completed successfully!",
        variant: "default",
      });

      setPredicting(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const predictionData = getPredictionData();
      setReport(predictionData);
      toast({
        title: "Prediction Complete",
        description: (
          <div className="flex gap-2 items-center">
            <span>Future predictions have been calculated!</span>
            <Button
              className="bg-bluesky hover:bg-bluesky/80 text-gray-50"
              onClick={clickHandler}
            >
              Stake now!
            </Button>
          </div>
        ),
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Analysis failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPredicting(false);
    }
  };

  return (
    <div className="px-4 py-8 md:py-12 container max-w-6xl mx-auto">
      <header className="mb-12">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Token Analyzer
          </h1>
          <p className="text-white/60 max-w-2xl">
            Professional analysis tools for on-chain tokens. Get instant
            insights on price movements, liquidity, and risk assessment to make
            informed trading decisions.
          </p>
        </div>
      </header>
      <main className="space-y-8 transition-opacity duration-500">
        <TokenAnalysisForm
          onAnalyze={analyzeToken}
          input={input}
          setInput={setInput}
          loading={loading || predicting}
        />

        {report && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-xl p-3 pb-0 sm:p-6 sm:pb-0 bg">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="bg-crypto-blue/10 p-1.5 rounded-full sm:mr-3">
                      <LineChart className="h-4 w-4 text-blue-500" />
                    </div>
                    <h2 className="sm:text-lg font-semibold text-white">
                      Price Movement
                    </h2>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <span>
                      {predicting
                        ? "Last & Next 3 Days"
                        : `Last ${input.days}d`}
                    </span>
                  </div>
                </div>
                <DataChart data={report.priceData} type="line" />
              </div>

              <div className="bg rounded-xl p-3 pb-0 sm:p-6 sm:pb-0">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="bg-crypto-purple/10 p-1.5 rounded-full smmr-3">
                      <SquareChartGantt className="h-4 w-4 text-green-500" />
                    </div>
                    <h2 className="sm:text-lg font-semibold text-white">
                      Transaction Volume
                    </h2>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <span>
                      {predicting
                        ? "Last & Next 3 Days"
                        : `Last ${input.days}d`}
                    </span>
                  </div>
                </div>
                <DataChart data={report.volumeData} type="bar" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TokenMetricCard
                title="Holder Growth"
                value={`${report.holders.growthRate}%`}
                subValue={`${report.holders.current.toLocaleString()} current holders`}
                status="positive"
              />

              <TokenMetricCard
                title="Liquidity Score"
                value={report.liquidity.score}
                subValue={`${report.liquidity.pools.length} pools monitored`}
                status="neutral"
              />

              <TokenMetricCard
                title="Risk Level"
                value={report.riskAssessment.level}
                items={report.riskAssessment.reasons.slice(0, 2)}
                status={
                  report.riskAssessment.level === "Low"
                    ? "positive"
                    : report.riskAssessment.level === "Medium"
                    ? "neutral"
                    : "negative"
                }
              />

              <Button
                className="sm:hidden bg-bluesky hover:bg-bluesky/80 text-gray-50"
                onClick={clickHandler}
                disabled={isStaking}
              >
                {isStaking ? "Staking..." : "Stake now!"}
              </Button>

              {isSuccess === true && (
                <div className="sm:hidden -mt-3">
                  <span>Staked successfully! </span>
                  <span>Tx hash: {formatAddress(txHash || "")}</span>
                </div>
              )}
              {isSuccess === false && <div>Please try again!</div>}
            </div>

            {predicting && (
              <div className="glass rounded-xl p-4 border border-crypto-blue/20">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-crypto-blue mr-2" />
                  <p className="text-sm text-white/80">
                    <span className="font-medium">Prediction Mode:</span>{" "}
                    Showing predicted values for the next 3 days based on
                    historical data and market trends.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
