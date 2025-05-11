"use client";

import { useEffect, useState } from "react";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Loader2 } from "lucide-react";
import usePortfolioData from "../../../hooks/usePortfolioData";
import { Position, LiquidityPosition } from "../../../types/interface";

import { formatVolume } from "../../../types/helper";
import { formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Sui wallet integration imports
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#00C49F", "#FF8042", "#FF6384"];

// Dummy positions for demo
const dummyData: Position[] = [
  { symbol: "SUI", icon: "/icons/eth.png", balance: 1.5, valueUSD: 4500, avgPrice: 3000, pnl: 20, acquiredAt: "2025-01-01T00:00:00Z" },
  { symbol: "FLOWX", icon: "/icons/btc.png", balance: 0.1, valueUSD: 4000, avgPrice: 50000, pnl: -5, acquiredAt: "2025-02-15T00:00:00Z" },
  { symbol: "USDC", icon: "/icons/usdc.png", balance: 2000, valueUSD: 2000, avgPrice: 1, pnl: 0, acquiredAt: "2025-03-01T00:00:00Z" },
  { symbol: "BTC", icon: "/icons/link.png", balance: 25, valueUSD: 500, avgPrice: 20, pnl: 15, acquiredAt: "2025-04-01T00:00:00Z" }
];

// Dummy liquidity for demo
const dummyLiquidity: LiquidityPosition[] = [
  { pool: "SUI/USDC", lpTokens: 12.42, valueUSD: 1800, apr: 5.2 },
  { pool: "WAL/SUI", lpTokens: 3.14, valueUSD: 1200, apr: 4.7 },
];

export default function Portfolio() {
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;
  const { data: fetchedData, isLoading, hasMore, loadMore } = usePortfolioData(walletAddress);

  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [isProcessingMobile, setIsProcessingMobile] = useState(false);

  const data = fetchedData.length > 0 ? fetchedData : dummyData;

  // State for liquidity positions
  const [liquidityPositions] = useState<LiquidityPosition[]>(dummyLiquidity);

  // State for review & recommendations
  const [score, setScore] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (walletAddress) {
      loadMore();
    }
  }, [walletAddress]);

  const handleReviewPortfolio = () => {
    const tokenValue = data.reduce((sum, t) => sum + t.valueUSD, 0);
    const lpValue = liquidityPositions.reduce((sum, lp) => sum + lp.valueUSD, 0);
    const total = tokenValue + lpValue;
    const calculatedScore = total > 0 ? Math.round((tokenValue / total) * 100) : 0;
    setScore(calculatedScore);
    setRecommendations([
      calculatedScore < 50
        ? 'Consider increasing your liquidity positions.'
        : 'Nice balance of tokens and liquidity!',
      'Review pools with APR above 5% for potential yields.'
    ]);
  };

  const handleMintBadge = async () => {
    setIsProcessingMobile(true); 
    const mnemonic = process.env.NEXT_PUBLIC_MNE || '';
    const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });
    const tx = new Transaction();

    const packageAdr = "0x5613e7f924cb9cd8e7607fd208f463876fe6f8099f75403d10f667bd06bfeabf";
    const address = keypair.getPublicKey().toSuiAddress();
    tx.setSender(address);
    tx.setGasBudget(10000000);

    tx.moveCall({
      target: `${packageAdr}::badge_nft::mint_project_nft`,
      arguments: [
          tx.pure.string("My Project"),                         // name
          tx.pure.string("Project description"),               // description
          tx.pure.string("https://project.url"),               // url
          tx.pure.u64(100),                               // target_transactions
          tx.pure.string("animal-id-1"),                       // theme_animal_id
          tx.pure.string("Lion"),                              // theme_animal_name
          tx.pure.string("https://animal.image/url.png"),      // theme_animal_image
          tx.pure.string("icon"),                    // theme_animal_icon
          tx.pure.string("icon"),                   // theme_animal_icon2
          tx.pure.u64(1),                                 // theme_animal_level
          tx.pure.u64(5),                                 // theme_animal_max_level
      ],
      typeArguments: [],
    });

    const { bytes, signature } = await tx.sign({ client, signer: keypair });

    const result = await client.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
      options: { showEffects: true },
      requestType: 'WaitForLocalExecution',
    });

    setTxDigest(result.digest);
    setIsProcessingMobile(false);
  };

  const renderTable = () => (
    <>      
      <Table className="table-auto bg-transparent">
        {/* existing table code */}
      </Table>
      <ScrollBar orientation="horizontal" />
      {hasMore && !isLoading && (
        <div className="flex justify-center p-4 border-t border-[#132D5B]">
          <Button size="lg" className="bg-[#132d5b] text-white border border-gray-700 hover:bg-[#1a3c73]" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="w-full flex justify-center px-2">
      <div className="flex-1 max-w-5xl">

        {/* Token Portfolio Chart */}
        {!isLoading && data.length > 0 && (
          <div className="mb-6 bg-[#0e203f] p-4 rounded-xl">
            <h2 className="text-white text-lg font-semibold mb-2">Token Allocation</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="valueUSD"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={`token-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${formatVolume(value)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Liquidity Portfolio Chart */}
        {!isLoading && liquidityPositions.length > 0 && (
          <div className="mb-6 bg-[#0e203f] p-4 rounded-xl">
            <h2 className="text-white text-lg font-semibold mb-2">Liquidity Allocation</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={liquidityPositions.map(lp => ({ name: lp.pool, value: lp.valueUSD }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#82ca9d"
                  label
                >
                  {liquidityPositions.map((entry, index) => (
                    <Cell key={`lp-cell-${index}`} fill={COLORS[(index+data.length) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${formatVolume(value)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Liquidity Positions Table */}
        <div className="mb-6 bg-[#0e203f] p-4 rounded-xl">
          <h2 className="text-white text-lg font-semibold mb-2">Liquidity Positions</h2>
          <Table className="table-auto bg-transparent">
            <TableHeader className="sticky top-0 bg-[#0e203f]">
              <TableRow>
                <TableHead>Pool</TableHead><TableHead>LP Tokens</TableHead><TableHead>Value (USD)</TableHead><TableHead>APR %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liquidityPositions.map((lp, idx) => (
                <TableRow key={idx} className="group hover:bg-blue-900 transition-colors duration-150">
                  <TableCell>{lp.pool}</TableCell>
                  <TableCell>{lp.lpTokens}</TableCell>
                  <TableCell>${formatVolume(lp.valueUSD)}</TableCell>
                  <TableCell className={lp.apr >= 0 ? "text-green-500" : "text-red-500"}>{lp.apr}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Desktop Portfolio Table */}
        <div className="hidden md:block">
          <ScrollArea className="w-full h-full">
            {renderTable()}
          </ScrollArea>
        </div>

        {/* Mobile Portfolio Cards */}
        <div className="md:hidden space-y-4">
          {/* existing mobile cards code */}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 my-4 justify-center">
          <Button onClick={handleReviewPortfolio}>Review Portfolio</Button>
          <Button variant="secondary" onClick={handleMintBadge}>Mint NFT Badge</Button>
        </div>

        {/* Score & Recommendations */}
        {score !== null && (
          <div className="bg-[#0e203f] p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Portfolio Score: {score}/100</h3>
            <ul className="list-disc list-inside text-gray-200">
              {recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </div>
        )}

        {txDigest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#132d5b] p-6 rounded-2xl shadow-xl flex flex-col items-center">
              {/* Pulsing ring + badge image */}
              <div className="relative mb-4">
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-white"></div>
                <Image
                  src="/badge_nft.png"
                  alt="Your NFT Badge"
                  width={120}
                  height={120}
                  className="rounded-full border-2 border-white relative"
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

        {isProcessingMobile && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-gray-700">Processing transaction…</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
