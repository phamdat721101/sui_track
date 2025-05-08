"use client";

import { useEffect } from "react";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Loader2 } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import usePortfolioData from "../../../hooks/usePortfolioData";
import { Position } from "../../../types/interface";
import { formatVolume } from "../../../types/helper";
import { formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#00C49F", "#FF8042", "#FF6384"];

// Dummy positions for demo
const dummyData: Position[] = [
  {
    symbol: "ETH",
    icon: "/icons/eth.png",
    balance: 1.2345,
    valueUSD: 3500,
    avgPrice: 2800,
    pnl: 25.0,
    acquiredAt: "2024-12-01T10:00:00Z",
  },
  {
    symbol: "BTC",
    icon: "/icons/btc.png",
    balance: 0.0567,
    valueUSD: 3000,
    avgPrice: 45000,
    pnl: -10.5,
    acquiredAt: "2025-01-15T14:30:00Z",
  },
  {
    symbol: "USDC",
    icon: "/icons/usdc.png",
    balance: 1500,
    valueUSD: 1500,
    avgPrice: 1,
    pnl: 0,
    acquiredAt: "2025-03-01T08:20:00Z",
  },
  {
    symbol: "LINK",
    icon: "/icons/link.png",
    balance: 20,
    valueUSD: 400,
    avgPrice: 18,
    pnl: 11.1,
    acquiredAt: "2025-02-10T09:45:00Z",
  },
];

export default function Portfolio() {
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;
  const { data: fetchedData, isLoading, hasMore, loadMore } = usePortfolioData(walletAddress);

  // Use dummyData if fetchedData is empty
  const data = fetchedData.length > 0 ? fetchedData : dummyData;

  useEffect(() => {
    if (walletAddress) {
      loadMore();
    }
  }, [walletAddress]);

  const renderTable = () => (
    <>      
      <Table className="table-auto bg-transparent">
        <TableHeader className="sticky top-0 bg-[#0e203f]">
          <TableRow>
            <TableHead className="sticky left-0 bg-[#0e203f]">Asset</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Value (USD)</TableHead>
            <TableHead>Avg. Price</TableHead>
            <TableHead>PnL %</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? [...Array(5)].map((_, i) => (
                <TableRow key={i} className="bg-[#0e203f]">
                  <TableCell colSpan={6} className="py-8 text-center text-gray-400">
                    <Loader2 className="animate-spin inline-block mr-2" /> Loading portfolio...
                  </TableCell>
                </TableRow>
              ))
            : data.map((pos: Position, idx: number) => (
                <TableRow key={idx} className="group hover:bg-blue-900 transition-colors duration-150">
                  <TableCell className="sticky left-0 bg-[#0e203f] group-hover:bg-blue-900 transition-colors duration-150 flex items-center gap-2">
                    <Image src={pos.icon} alt={pos.symbol} width={20} height={20} className="rounded-full" />
                    <span className="font-semibold text-gray-400">{pos.symbol}</span>
                  </TableCell>
                  <TableCell>{pos.balance}</TableCell>
                  <TableCell>${formatVolume(pos.valueUSD)}</TableCell>
                  <TableCell>${pos.avgPrice.toFixed(4)}</TableCell>
                  <TableCell className={pos.pnl >= 0 ? "text-green-500" : "text-red-500"}>{pos.pnl.toFixed(2)}%</TableCell>
                  <TableCell>{pos.acquiredAt ? formatDistanceToNowStrict(new Date(pos.acquiredAt)) : "-"}</TableCell>
                </TableRow>
              ))}
        </TableBody>
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

        {/* Portfolio Pie Chart */}
        {!isLoading && data.length > 0 && (
          <div className="mb-6 bg-[#0e203f] p-4 rounded-xl">
            <h2 className="text-white text-lg font-semibold mb-2">Portfolio Allocation</h2>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${formatVolume(value)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Desktop Portfolio Table */}
        <div className="hidden md:block">
          <ScrollArea className="w-full h-full">
            {renderTable()}
          </ScrollArea>
        </div>

        {/* Mobile Portfolio Cards */}
        <div className="md:hidden space-y-4">
          {isLoading
            ? <div className="py-12 text-center text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" />Loading portfolio...</div>
            : data.map((pos: Position, idx: number) => (
                <div key={idx} className="bg-[#0e203f] rounded-lg p-4 shadow flex flex-col">
                  <div className="flex items-center mb-2">
                    <Image src={pos.icon} alt={pos.symbol} width={24} height={24} className="rounded-full mr-2" />
                    <span className="font-semibold">{pos.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Balance</span><span>{pos.balance}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span>Value</span><span>${formatVolume(pos.valueUSD)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span>PnL</span><span className={pos.pnl >= 0 ? "text-green-500" : "text-red-500"}>{pos.pnl.toFixed(2)}%</span>
                  </div>
                  <Button size="sm" className="px-4 py-2 self-end bg-[#132d5b] text-white border border-gray-700 hover:bg-[#1a3c73]">
                    View Details
                  </Button>
                </div>
              ))}
          {hasMore && !isLoading && (
            <div className="flex justify-center">
              <Button size="lg" className="bg-[#132d5b] text-white border border-gray-700 hover:bg-[#1a3c73]" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
