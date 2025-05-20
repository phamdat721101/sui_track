"use client";

import { Loader2, PlusIcon, ChevronDown } from "lucide-react";
import { ScrollArea, ScrollAreaViewport, ScrollBar } from "../../ui/scroll-area";
import { Button } from "../../ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";
import { useContext, useEffect, useState, useMemo } from "react";
import { formatVolume } from "../../../types/helper";
import OperationDialog from "./OperationDialog";
import GlobalContext from "../../../context/store";
import axios from "axios";
import { Pool } from "../../../types/interface";
import { useRouter } from "next/navigation";

// Sui wallet integration imports
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

// Chart imports for analysis visualization
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export default function Pools() {
  const { selectedChain } = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [poolData, setPoolData] = useState<Pool[]>([]);
  const router = useRouter();
  const limitPool = 3;
  const [page, setPage] = useState(1);

  // New filter states
  const [strategyFilter, setStrategyFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>(['flowx']);
  const [tokenFilter, setTokenFilter] = useState<string[]>([]);

  // Track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<null | 'strategy' | 'platform' | 'token'>(null);

  // Highlight "All" when in reset state
  const isAllActive =
    strategyFilter.length === 0 &&
    platformFilter.length === 1 &&
    platformFilter[0] === 'flowx' &&
    tokenFilter.length === 0;

  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [isProcessingMobile, setIsProcessingMobile] = useState(false);

  // Sui wallet hooks
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction();

  const clickHandler = () => {
    router.push(`/tracker`);
  };

  const handleInvest = async (item: Pool) => {
    if (!currentAccount) {
      alert('Please connect your wallet');
      return;
    }
    try {
      const txb = new Transaction();
      txb.transferObjects(
        [txb.splitCoins(txb.gas, [txb.pure.u64(1000)])],
        currentAccount.address
      );
      const result = await signAndExecuteTransactionBlock({ transaction: txb });
      alert('Transaction submitted: ' + result.digest);
    } catch (err) {
      console.error(err);
      alert('Transaction failed: ' + err);
    }
  };

  const handleInvestMobile = async (item: Pool) => {
    setIsProcessingMobile(true);
    const mnemonic = process.env.NEXT_PUBLIC_MNE || '';
    const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });
    const tx = new Transaction();

    const packageAdr =
      "0x5dda419f3a10a6d0f8add4008e0445210a35fcdfafb2fff99793a1790d83651a";
    const address = keypair.getPublicKey().toSuiAddress();
    tx.setSender(address);

    const gasCoin = tx.gas;
    const splitCoin = tx.splitCoins(gasCoin, [10000000]);

    tx.moveCall({
      target: `${packageAdr}::fundx::contribute`,
      arguments: [
        tx.object(item.pool.address),
        splitCoin,
        tx.pure.u64(100000),
        tx.object("0x6"),
      ],
      typeArguments: [],
    });

    const { bytes, signature } = await tx.sign({ client, signer: keypair });
    const result = await client.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
      options: { showEffects: true },
      requestType: "WaitForLocalExecution",
    });

    setTxDigest(result.digest);
    setIsProcessingMobile(false);
  };

  useEffect(() => {
    const fetchPools = async () => {
      setIsLoading(true);
      try {
        const { data, status } = await axios.get<Pool[]>(
          `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/yield/pools`,
          { params: { chain: selectedChain, offset: page, limit: limitPool } }
        );
        if (status === 200) {
          setPoolData(prev => (page === 1 ? data : [...prev, ...data]));
          setHasMore(data.length === limitPool);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPools();
  }, [selectedChain, page]);

  // Combined multi‑filter
  const visiblePools = useMemo(() => {
    return poolData.filter(item => {
      const byStrategy =
        strategyFilter.length === 0 ||
        strategyFilter.some(s =>
          item.pool.name.toLowerCase().includes(s)
        );
      const byPlatform =
        platformFilter.length === 0 ||
        platformFilter.includes(item.pool.name.toLowerCase());
      const byToken =
        tokenFilter.length === 0 ||
        tokenFilter.includes(item.pool.symbol.toLowerCase());
      return byStrategy && byPlatform && byToken;
    });
  }, [poolData, strategyFilter, platformFilter, tokenFilter]);

  const chartData = useMemo(() => {
    if (!isLoading) return [];
    return Array.from({ length: 10 }).map((_, i) => ({
      name: `T${i}`,
      value: Math.random() * 100,
    }));
  }, [isLoading]);

  return (
    <div className="w-full flex justify-center px-2">
      <div className="flex-1 max-w-5xl">

        {/* Filters Strip */}
        <div className="relative overflow-visible flex items-center space-x-4 mb-6 border-b border-gray-700 pb-2">

          {/* All Pill */}
          <Button
            onClick={() => {
              setStrategyFilter([]);
              setPlatformFilter(['flowx']);
              setTokenFilter([]);
            }}
            className={`px-4 py-2 rounded-full ${
              isAllActive ? 'bg-gold text-black' : 'bg-[#1a243b] text-gray-400'
            }`}
          >
            All
          </Button>

          {/* Strategy Dropdown */}
          <div className="relative">
            <Button
              className="px-4 py-2 bg-[#1a243b] text-gray-200 rounded flex items-center"
              onClick={() =>
                setOpenDropdown(openDropdown === 'strategy' ? null : 'strategy')
              }
            >
              {strategyFilter.length ? strategyFilter.join(', ') : 'Strategy'}
              <ChevronDown className="ml-2" size={16} />
            </Button>
            {openDropdown === 'strategy' && (
              <div className="absolute mt-2 bg-[#1a243b] rounded shadow-lg z-10">
                {['dex','lending','yield farming','vault'].map(opt => (
                  <div
                    key={opt}
                    className="px-4 py-2 hover:bg-[#132d5b] cursor-pointer"
                    onClick={() =>
                      setStrategyFilter(curr =>
                        curr.includes(opt)
                          ? curr.filter(x => x !== opt)
                          : [...curr, opt]
                      )
                    }
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DeFi Platform Dropdown */}
          <div className="relative">
            <Button
              className="px-4 py-2 bg-[#1a243b] text-gray-200 rounded flex items-center"
              onClick={() =>
                setOpenDropdown(openDropdown === 'platform' ? null : 'platform')
              }
            >
              {platformFilter.join(', ')}
              <ChevronDown className="ml-2" size={16} />
            </Button>
            {openDropdown === 'platform' && (
              <div className="absolute mt-2 bg-[#1a243b] rounded shadow-lg z-10">
                {['flowx','cetus','bluefin','scallop'].map(opt => (
                  <div
                    key={opt}
                    className="px-4 py-2 hover:bg-[#132d5b] cursor-pointer"
                    onClick={() =>
                      setPlatformFilter(curr =>
                        curr.includes(opt)
                          ? curr.filter(x => x !== opt)
                          : [...curr, opt]
                      )
                    }
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Token Dropdown */}
          <div className="relative">
            <Button
              className="px-4 py-2 bg-[#1a243b] text-gray-200 rounded flex items-center"
              onClick={() =>
                setOpenDropdown(openDropdown === 'platform' ? null : 'platform')
              }
            >
              {platformFilter.length
                ? platformFilter
                    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                    .join(', ')
                : 'Platform'}
              <ChevronDown className="ml-2" size={16} />
            </Button>
            {openDropdown === 'token' && (
              <div className="absolute mt-2 bg-[#1a243b] rounded shadow-lg z-10">
                {['hasui','usdc','ausd','musd'].map(opt => (
                  <div
                    key={opt}
                    className="px-4 py-2 hover:bg-[#132d5b] cursor-pointer"
                    onClick={() =>
                      setTokenFilter(curr =>
                        curr.includes(opt)
                          ? curr.filter(x => x !== opt)
                          : [...curr, opt]
                      )
                    }
                  >
                    {opt.toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          {isLoading && (
            <div className="w-full h-40 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#82ca9d"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <ScrollArea className="w-full h-full">
            <ScrollAreaViewport
              className="w-full h-full"
              onScroll={e => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (
                  scrollHeight - scrollTop <= clientHeight + 20 &&
                  hasMore &&
                  !isLoading
                ) {
                  setPage(p => p + 1);
                }
              }}
            >
              <Table className="table-auto bg-transparent">
                {isLoading ? (
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-gray-400"
                      >
                        <Loader2 className="animate-spin inline-block mr-2" />
                        Analyzing on-chain data...
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <>
                    <TableHeader className="sticky top-0 bg-[#0e203f]">
                      <TableRow>
                        <TableHead className="sticky left-0 bg-[#0e203f]">
                          Pool
                        </TableHead>
                        <TableHead>TVL</TableHead>
                        <TableHead>APR</TableHead>
                        <TableHead>Earn</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visiblePools.length ? (
                        visiblePools.map((item, idx) => (
                          <TableRow
                            key={idx}
                            onClick={clickHandler}
                            className="group hover:bg-blue-900"
                          >
                            <TableCell className="sticky left-0 bg-[#0e203f]">
                              <div className="flex items-center">
                                <img
                                  src={'/dexes/flowx.png'}
                                  alt={'/dexes/flowx.png'}
                                  className="w-5 h-5 mr-2"
                                />
                                {item.pool.symbol}
                              </div>
                            </TableCell>
                            <TableCell>
                              ${formatVolume(item.pool.tvl)}
                            </TableCell>
                            <TableCell>
                              {item.pool.apr.toFixed(3)}%
                            </TableCell>
                            <TableCell>
                              <a
                                href={`https://flowx.finance/explore/pools/${item.pool.pool_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  size="sm"
                                  className="bg-[#132d5b] text-white border border-gray-700 hover:bg-[#1a3c73]"
                                >
                                  Earn
                                </Button>
                              </a>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-4"
                          >
                            No pools found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </>
                )}
              </Table>
              <ScrollBar orientation="horizontal" />
              {hasMore && !isLoading && (
                <div className="flex justify-center p-4 border-t border-[#132D5B]">
                  <Button
                    className="bg-[#132d5b] text-white border border-gray-700 hover:bg-[#1a3c73]"
                    size="lg"
                    onClick={() => setPage(p => p + 1)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </ScrollAreaViewport>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <>
              <div className="w-full h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#82ca9d"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="py-12 text-center text-gray-400">
                <Loader2 className="animate-spin inline-block mr-2" />
                Analyzing on-chain data...
              </div>
            </>
          ) : (
            visiblePools.map((item, idx) => (
              <div
                key={idx}
                onClick={clickHandler}
                className="bg-[#0e203f] rounded-lg p-4 shadow flex flex-col"
              >
                <div className="flex justify-between mb-2">
                  <div className="flex items-center font-semibold">
                    <img
                      src={'/dexes/flowx.png'}
                      alt={'/dexes/flowx.png'}
                      className="w-5 h-5 mr-2"
                    />
                    {item.pool.symbol}
                  </div>
                  <span className="text-sm">
                    {item.pool.apr.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-gray-400">TVL</span>
                  <span className="text-sm">
                    ${formatVolume(item.pool.tvl)}
                  </span>
                </div>
                <a
                  href={`https://flowx.finance/explore/pools/${item.pool.pool_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-4 py-2 self-end bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  >
                    Earn
                  </Button>
                </a>
                <Button
                  size="sm"
                  className="mt-2 bg-[#132d5b] text-white border border-gray-700 hover:bg-[#1a3c73]"
                  onClick={e => {
                    e.stopPropagation();
                    handleInvestMobile(item);
                  }}
                >
                  <PlusIcon className="mr-1" /> Invest 1 SUI
                </Button>
              </div>
            ))
          )}
          {hasMore && !isLoading && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                onClick={() => setPage(p => p + 1)}
              >
                Load More
              </Button>
            </div>
          )}

          {txDigest && (
            <div className="fixed bottom-6 right-6 bg-[#132d5b] text-white px-5 py-4 rounded-lg shadow-lg z-50 max-w-xs">
              <p className="font-semibold text-sm">Transaction Submitted!</p>
              <a
                href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-sm mt-1 block"
              >
                View on Sui Explorer
              </a>
              <button
                onClick={() => setTxDigest(null)}
                className="mt-2 text-xs hover:underline"
              >
                Close
              </button>
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

      <OperationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        initialTab="swap"
      />
    </div>
  );
}
