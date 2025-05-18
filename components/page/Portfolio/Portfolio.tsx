"use client";

import { useEffect, useState } from "react";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Loader2 } from "lucide-react";
import usePortfolioData from "../../../hooks/usePortfolioData";
import { Position, LiquidityPosition } from "../../../types/interface";
import { formatVolume } from "../../../types/helper";
import Image from "next/image";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#00C49F",
  "#FF8042",
  "#FF6384",
];

// Base API URL from env
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.noodles.fi/api/v1";

export default function Portfolio() {
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;

  // Locally entered address to query
  const [address, setAddress] = useState<string>("");

  // Loading & error states for fetches
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetched holdings & LPs
  const [tokenHoldings, setTokenHoldings] = useState<Position[]>([]);
  const [liquidityPositions, setLiquidityPositions] = useState<LiquidityPosition[]>([]);

  // NFT badge state & portfolio review
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // On address submit, fetch from API
  const fetchPortfolio = async (addr: string) => {
    setLoadingData(true);
    setFetchError(null);
    try {
      const [coinsRes, lpsRes] = await Promise.all([
        fetch(`${API_BASE}/portfolio/coins?address=${addr}`),
        fetch(`${API_BASE}/portfolio/lps?address=${addr}`),
      ]);
      if (!coinsRes.ok || !lpsRes.ok) {
        throw new Error(`API error: coins ${coinsRes.status}, lps ${lpsRes.status}`);
      }
      const coinsBody = await coinsRes.json();
      const lpsBody = await lpsRes.json();
      // API returns { data: [...] }
      setTokenHoldings(coinsBody.data);
      setLiquidityPositions(lpsBody.data);
    } catch (e: any) {
      setFetchError(e.message || "Fetch failed");
    } finally {
      setLoadingData(false);
    }
  };

  // Automatic fetch on paste / address change
  useEffect(() => {
    if (
      address.trim() &&
      !loadingData &&
      tokenHoldings.length === 0 &&
      liquidityPositions.length === 0 &&
      !fetchError
    ) {
      fetchPortfolio(address.trim());
    }
  }, [address]);

  // Handle address form submit (kept for manual submit fallback)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      fetchPortfolio(address.trim());
    }
  };

  // Portfolio review logic
  const handleReviewPortfolio = () => {
    const totalTokens = tokenHoldings.reduce((sum, t) => sum + t.usd_value * t.amount, 0);
    const totalLP = liquidityPositions.reduce(
      (sum, lp) => sum + lp.a_usd_value + lp.b_usd_value,
      0
    );
    const total = totalTokens + totalLP;
    const pct = total > 0 ? Math.round((totalTokens / total) * 100) : 0;
    setScore(pct);
    setRecommendations([
      pct < 50
        ? "Consider shifting into more liquidity positions."
        : "Great balance between tokens and liquidity!",
      "Check positions with high fees or low rewards.",
    ]);
  };

  const handleMintBadge = async () => {
    setIsProcessing(true);
    const mnemonic = process.env.NEXT_PUBLIC_MNE || "";
    const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
    const client = new SuiClient({ url: getFullnodeUrl("testnet") });
    const tx = new Transaction();
    const pkg = "0x5613e7f924cb9cd8e7607fd208f463876fe6f8099f75403d10f667bd06bfeabf";

    tx.setSender(keypair.getPublicKey().toSuiAddress());
    tx.setGasBudget(10000000);
    tx.moveCall({
      target: `${pkg}::badge_nft::mint_project_nft`,
      arguments: [
        tx.pure.string("My Project"),
        tx.pure.string("Project description"),
        tx.pure.string("https://project.url"),
        tx.pure.u64(100),
        tx.pure.string("animal-id-1"),
        tx.pure.string("Lion"),
        tx.pure.string("https://animal.image/url.png"),
        tx.pure.string("icon"),
        tx.pure.string("icon"),
        tx.pure.u64(1),
        tx.pure.u64(5),
      ],
      typeArguments: [],
    });

    const { bytes, signature } = await tx.sign({ client, signer: keypair });
    const res = await client.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
      options: { showEffects: true },
      requestType: "WaitForLocalExecution",
    });
    setTxDigest(res.digest);
    setIsProcessing(false);
  };

  // Prompt for address
  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin mb-4" />
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter wallet address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="px-4 py-2 border rounded"
          />
          <Button type="submit">Load</Button>
        </form>
      </div>
    );
  }

  // Show fetching spinner
  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
        <Loader2 className="animate-spin mb-4" />
        <p className="text-gray-200">Fetching portfolio…</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center px-2 py-4">
      <div className="flex-1 max-w-5xl space-y-4">
        {/* Scan New Address */}
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={() => {
            setAddress("");
            setTokenHoldings([]);
            setLiquidityPositions([]);
            setFetchError(null);
            setScore(null);
          }}>
            Scan New Address
          </Button>
        </div>

        {fetchError && (
          <div className="text-red-400">Error loading portfolio: {fetchError}</div>
        )}

        {/* Token Allocation Chart */}
        <div className="bg-[#0e203f] p-4 rounded-xl">
          <h2 className="text-white text-xl font-semibold mb-2">Token Allocation</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={tokenHoldings}
                dataKey="usd_value"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {tokenHoldings.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `$${formatVolume(v)}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Liquidity Allocation Chart */}
        <div className="bg-[#0e203f] p-4 rounded-xl">
          <h2 className="text-white text-xl font-semibold mb-2">Liquidity Allocation</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={liquidityPositions.map((lp) => ({
                  name: `${lp.coin_a_symbol}/${lp.coin_b_symbol}`,
                  value: lp.a_usd_value + lp.b_usd_value,
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {liquidityPositions.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[(i + tokenHoldings.length) % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `$${formatVolume(v)}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Token Holdings Table */}
        <div className="bg-[#0e203f] p-4 rounded-xl">
          <h2 className="text-white text-xl font-semibold mb-2">Token Holdings</h2>
          <ScrollArea className="h-64 md:h-96">
            <Table className="text-sm md:text-base">
              <TableHeader className="sticky top-0 bg-[#0e203f] z-10">
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>USD Value</TableHead>
                  <TableHead>24h PnL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokenHoldings.map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-2">
                      <Image src={t.url} width={24} height={24} alt={t.symbol} unoptimized/>
                      {t.symbol}
                    </TableCell>
                    <TableCell>{t.amount}</TableCell>
                    <TableCell>${formatVolume(t.usd_value * t.amount)}</TableCell>
                    <TableCell
                      className={
                        t.pnl_percent_today >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {t.pnl_today} ({t.pnl_percent_today}%)
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Liquidity Positions Table */}
        <div className="bg-[#0e203f] p-4 rounded-xl">
          <h2 className="text-white text-xl font-semibold mb-2">Liquidity Positions</h2>
          <ScrollArea className="h-64 md:h-96">
            <Table className="text-sm md:text-base">
              <TableHeader className="sticky top-0 bg-[#0e203f] z-10">
                <TableRow>
                  <TableHead>Pool</TableHead>
                  <TableHead>A Amount</TableHead>
                  <TableHead>B Amount</TableHead>
                  <TableHead>USD Total</TableHead>
                  <TableHead>24h PnL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liquidityPositions.map((lp, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={lp.coin_a_url}
                          width={20}
                          height={20}
                          alt={lp.coin_a_symbol}
                          unoptimized
                        />
                        <Image
                          src={lp.coin_b_url}
                          width={20}
                          height={20}
                          alt={lp.coin_b_symbol}
                          unoptimized
                        />
                        {lp.coin_a_symbol}/{lp.coin_b_symbol}
                      </div>
                    </TableCell>
                    <TableCell>{lp.amount_a.toFixed(2)}</TableCell>
                    <TableCell>{lp.amount_b.toFixed(2)}</TableCell>
                    <TableCell>
                      ${formatVolume(lp.a_usd_value + lp.b_usd_value)}
                    </TableCell>
                    <TableCell
                      className={
                        lp.pnl_percent_today >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {lp.pnl_today} ({lp.pnl_percent_today}%)
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 my-4 justify-center">
          <Button className="w-full sm:w-auto" onClick={handleReviewPortfolio}>
            Review Portfolio
          </Button>
          <Button
            className="w-full sm:w-auto"
            variant="secondary"
            onClick={handleMintBadge}
          >
            Mint NFT Badge
          </Button>
        </div>

        {/* Spinner & Modal (unchanged) */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-gray-700">Processing transaction…</p>
            </div>
          </div>
        )}
        {txDigest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#132d5b] p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-white"></div>
                <Image
                  src="/badge_nft.png"
                  alt="NFT Badge"
                  width={120}
                  height={120}
                  className="rounded-full border-2 border-white"
                  unoptimized
                />
              </div>
              <p className="text-white font-semibold mb-2">🎉 NFT Badge Minted!</p>
              <a
                href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-sm text-blue-200 mb-4"
              >
                View on Sui Explorer
              </a>
              <Button
                onClick={() => setTxDigest(null)}
                className="bg-white text-[#132d5b] px-6"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Portfolio Score */}
        {score !== null && (
          <div className="bg-[#0e203f] p-4 rounded-lg text-white">
            <h3 className="font-semibold mb-2">Portfolio Score: {score}%</h3>
            <ul className="list-disc list-inside">
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
