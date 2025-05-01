"use client";

import { Loader2, PlusIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Button } from "../../ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import { useContext, useEffect, useState } from "react";
import { LoadingRow } from "./CryptoTable";
import { formatVolume } from "../../../types/helper";
import OperationDialog from "./OperationDialog";
import GlobalContext from "../../../context/store";
import axios from "axios";
import { Pool, TokenInfoSui } from "../../../types/interface";
import { useRouter } from "next/navigation";

// Sui wallet integration imports
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

export default function Pools() {
  const { selectedChain } = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"swap"|"add"|"remove">("swap");
  const [poolData, setPoolData] = useState<Pool[]>([]);
  const router = useRouter();
  const limitPool = 3;

  // Sui wallet hooks
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction();

  const clickHandler = () => {
    router.push(`/tracker`);
  };

  const openDialog = (tab: "swap"|"add"|"remove") => {
    setSelectedTab(tab);
    setShowDialog(true);
  };

  const handleInvest = async (token: any) => {
    if (!currentAccount) {
      alert('Please connect your wallet');
      return;
    }
    try {
      // Build a transaction block to buy token (modify with actual DEX calls)
      const txb = new Transaction();
      // Example: Swap 0.01 SUI for token via router (replace address and module)
      // const coins = txb.splitCoins(txb.gas, [txb.pure(10_000_000_000)]); // 0.01 SUI in MIST
      // txb.moveCall({
      //   target: '0xROUTER_ADDRESS::router::swap_sui_for_tokens',
      //   arguments: [coins, txb.pure(token.token_type)],
      // });

      // For now, just send a transfer of dust SUI to yourself as demo
      txb.transferObjects([txb.splitCoins(txb.gas, [txb.pure.u64(1000)])], currentAccount.address);

      const result = await signAndExecuteTransactionBlock({
        transaction: txb,
      });
      console.log('invest transaction result:', result);
      alert('Transaction submitted: ' + result.digest);
    } catch (err) {
      console.error('Buy transaction failed:', err);
      alert('Transaction failed: ' + err);
    }
  };

  useEffect(() => {
    const fetchPools = async () => {
      setIsLoading(true);
      try {
        const { data, status } = await axios.get<Pool[]>(
          `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/yield/pools`,
          { params: { chain: selectedChain, limit: limitPool } }
        );
        if (status === 200) setPoolData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPools();
  }, [selectedChain]);

  return (
    <div className="w-full flex justify-center px-2">
      <div className="flex-1 max-w-5xl">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <ScrollArea className="w-full h-full">
            <Table className="table-auto bg-transparent">
              {isLoading ? (
                <TableBody>
                  {[...Array(5)].map((_, i) => <LoadingRow key={i} />)}
                </TableBody>
              ) : (
                <>
                  <TableHeader className="sticky top-0 bg-[#0e203f]">
                    <TableRow>
                      <TableHead className="sticky left-0 bg-[#0e203f]">Pool</TableHead>
                      <TableHead>TVL</TableHead>
                      <TableHead>APR</TableHead>
                      <TableHead>Invest</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poolData.length
                      ? poolData.map((item, idx) => (
                          <TableRow key={idx} onClick={clickHandler} className="group hover:bg-blue-900">
                            <TableCell className="sticky left-0 bg-[#0e203f]">
                              {item.pool?.symbol || "N/A"}
                            </TableCell>
                            <TableCell>${formatVolume(item.pool?.tvl) || "-"}</TableCell>
                            <TableCell>{item.pool.apr.toFixed(3)}%</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                className="flex items-center bg-[#132d5b] text-white border border-gray-700 hover:bg-[#1a3c73]"
                                onClick={e => { e.stopPropagation(); handleInvest(item); }}
                              >
                                <PlusIcon className="mr-1" /> Invest
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">No pools found</TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </>
              )}
            </Table>
            <ScrollBar orientation="horizontal" />
            {hasMore && (
              <div className="flex justify-center p-4 border-t border-[#132D5B]">
                <Button
                  className="bg-[#132d5b] text-white border border-gray-700 hover:bg-[#1a3c73]"
                  size="lg"
                  disabled={isLoading}
                  onClick={() => {/* load more logic */}}
                >
                  {isLoading
                    ? <><Loader2 className="animate-spin mr-2" />Loading...</>
                    : "Load More"}
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-[#0e203f] rounded-lg h-24" />
              ))
            : poolData.map((item, idx) => (
                <div
                  key={idx}
                  onClick={clickHandler}
                  className="bg-[#0e203f] rounded-lg p-4 shadow flex flex-col"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{item.pool?.symbol}</span>
                    <span className="text-sm">{item.pool.apr.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-gray-400">TVL</span>
                    <span className="text-sm">${formatVolume(item.pool?.tvl)}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-4 py-2 self-end bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                    onClick={e => { e.stopPropagation(); openDialog("add"); }}
                  >
                    <PlusIcon className="mr-1" /> Invest
                  </Button>
                </div>
              ))
          }

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                disabled={isLoading}
                onClick={() => {/* load more logic */}}
              >
                {isLoading
                  ? <><Loader2 className="animate-spin mr-2" />Loading...</>
                  : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <OperationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        initialTab={selectedTab}
      />
    </div>
  );
}
