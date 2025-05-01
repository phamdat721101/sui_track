"use client";

import { SendIcon, ChevronsUpDownIcon, CopyIcon, GlobeIcon, ClipboardCheckIcon, SparklesIcon, Loader2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Button } from "../../ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";
import { useRouter } from "next/navigation";
import { PricePredictionData, TokenInfo, TokenInfoSui, TokenMoveFunInfo } from "../../../types/interface";
import { formatAddress, formatTokenPrice, formatVolume, isMovefunTokenInfo, isTokenInfo } from "../../../types/helper";
import { format, formatDistanceToNowStrict } from "date-fns";
import { useContext, useEffect, useState } from "react";
import GlobalContext from "../../../context/store";
import axios from "axios";
import { Skeleton } from "../../ui/Skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../ui/Alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import Image from "next/image";
import Twitter from "../../icons/twitter";
import PricePredictionModal from "./PricePrediction";
import { PriceFormatter } from "../PriceFormatter";

// Sui wallet integration imports
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

interface CryptoTableProps {
  dex?: string;
}

export default function CryptoTable({ dex }: CryptoTableProps) {
  const { setSelectedToken, selectedChain } = useContext(GlobalContext);
  const [tokenInfoList, setTokenInfoList] = useState<TokenInfo[]>([]);
  const [tokenMovefunList, setTokenMovefunList] = useState<TokenMoveFunInfo[]>(
    []
  );
  const [tokenInfoSuiList, setTokenInfoSuiList] = useState<TokenInfoSui[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedTokenIds, setCopiedTokenIds] = useState<Set<string>>(new Set());
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pricePrediction, setPricePrediction] =
    useState<PricePredictionData | null>(null);
  const itemsPerPage = 10;
  const [txDigest, setTxDigest] = useState<string | null>(null);

  // Sui wallet hooks
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction();

  const clickHandler = (token: TokenInfo | TokenInfoSui | TokenMoveFunInfo) => {
    setSelectedToken(token);
    if (isTokenInfo(token)) {
      router.push(`/token/${token.mintAddr}`);
    } else if (isMovefunTokenInfo(token)) {
      router.push(`/token/${token.address}`);
    } else {
      router.push(`/token/${token.token_address}`);
    }
  };

  const handleBuy = async (token: TokenInfoSui) => {
    if (!currentAccount) {
      alert('Please connect your wallet');
      return;
    }
    try {
      // Build a transaction block to buy token (modify with actual DEX calls)
      const txb = new Transaction();     
      // For now, just send a transfer of dust SUI to yourself as demo
      txb.transferObjects([txb.splitCoins(txb.gas, [txb.pure.u64(1000)])], currentAccount.address);

      const result = await signAndExecuteTransactionBlock({
        transaction: txb,
      });
      alert('Transaction submitted: ' + result.digest);
    } catch (err) {
      console.error('Buy transaction failed:', err);
      alert('Transaction failed: ' + err);
    }
  };

  // Mobile-only purchase flow (e.g. show a bottom sheet, simpler UX, etc.)
  const handleBuyMobile = async (token: TokenInfoSui) => {
    const mnemonic = process.env.NEXT_PUBLIC_MNE || '';
    const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });
    const tx = new Transaction();

    const packageAdr = "0x5dda419f3a10a6d0f8add4008e0445210a35fcdfafb2fff99793a1790d83651a";
    const address = keypair.getPublicKey().toSuiAddress();
    tx.setSender(address);

    const gasCoin = tx.gas;
    const splitCoin = tx.splitCoins(gasCoin, [10000000]);

    tx.moveCall({
      target: `${packageAdr}::fundx::contribute`,
      arguments: [
        tx.object("0xb9ccb3ec2acb0629fbb5a0dc32e4d8c3b3ccc6e444901960640564e2d9376977"),
        splitCoin,
        tx.pure.u64(100000),
        tx.object('0x6')
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
  };

  const copyAddress = async (
    token: TokenInfo | TokenInfoSui | TokenMoveFunInfo
  ) => {
    setSelectedToken(token);
    try {
      if (isTokenInfo(token)) {
        await navigator.clipboard.writeText(token.mintAddr);
      } else if (isMovefunTokenInfo(token)) {
        await navigator.clipboard.writeText(token.address);
      } else {
        await navigator.clipboard.writeText(token.token_address);
      }
      setCopiedTokenIds((prev) => {
        const newSet = new Set(prev);
        if (isTokenInfo(token)) {
          newSet.add(token.id);
        } else if (isMovefunTokenInfo(token)) {
          newSet.add(token.address);
        } else {
          newSet.add(token.symbol);
        }
        return newSet;
      });
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedTokenIds((prev) => {
          const newSet = new Set(prev);
          if (isTokenInfo(token)) {
            newSet.delete(token.id);
          } else if (isMovefunTokenInfo(token)) {
            newSet.delete(token.address);
          } else {
            newSet.delete(token.symbol);
          }
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error("Cannot copy address");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const predictionHandler = async (name: string, symbol: string) => {
    setIsPredictionLoading(true);
    setIsPredictionOpen(true);
    const url = "https://api.trackit-app.xyz/v1/agent/price_prediction";
    const value = {
      name,
      symbol,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      });

      const result = await response.json();
      console.log(result);
      setPricePrediction(result);
      setIsPredictionLoading(false);
    } catch (error) {
      console.log("Failed to prediction.");
    }
  };

  const fetchTokenInfoList = async () => {
    setIsLoading(true);
    try {
      let url: string;
      if (selectedChain === "movement" && dex === "Move.Fun") {
        url = `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/move_fun/list`;
      } else {
        url = `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/token/list?limit=${itemsPerPage}&offset=${currentPage}&chain=sui`;
      }
      const response = await axios.get(url);

      if (response.status === 200) {
        if (selectedChain === "sui") {
          const data: TokenInfoSui[] = response.data;
          setTokenInfoSuiList((prev) => [...prev, ...data]);
          setCurrentPage((prev) => prev + 1);
        } else {
          if (dex === "Move.Fun") {
            const data: TokenMoveFunInfo[] = response.data;
            setTokenMovefunList((prev) => [...prev, ...data]);
          } else {
            const data: TokenInfo[] = response.data;
            setTokenInfoList((prev) => [...prev, ...data]);
            setCurrentPage((prev) => prev + 1);
          }
        }
      }
    } catch (err) {
      setError("Failed to fetch governance data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTokenInfoList([]);
    setTokenInfoSuiList([]);
    setTokenMovefunList([]);
    setCurrentPage(1);

    fetchTokenInfoList();
  }, [selectedChain, dex]);

  return (
    <>
      {/* Table Section */}
      <div className="flex-1 max-w-full overflow-hidden">
        <ScrollArea className="w-full h-full">
          <Table className="table bg">
            {isLoading && (
              <TableBody>
                {[...Array(14)].map((_, index) => (
                  <LoadingRow key={index} />
                ))}
              </TableBody>
            )}
            {!isLoading && (
              <>
                <TableHeader className="sticky top-0 z-50 bg">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="sticky left-0 z-20 bg-[#0e203f] min-w-52 text-gray-400 font-medium">
                      Token
                    </TableHead>
                    <TableHead className="min-w-32 text-gray-400 font-medium">
                      <button className="flex gap-1 items-center">
                        Age <ChevronsUpDownIcon width={14} height={14} />
                      </button>
                    </TableHead>
                    <TableHead className="min-w-28 text-gray-400 font-medium">
                      <button className="flex gap-1 items-center">
                        Price <ChevronsUpDownIcon width={14} height={14} />
                      </button>
                    </TableHead>
                    <TableHead className="min-w-28 text-gray-400 font-medium">
                      <button className="flex gap-1 items-center">
                        Liq/MC <ChevronsUpDownIcon width={14} height={14} />
                      </button>
                    </TableHead>                    
                    <TableHead className="min-w-28 text-gray-400 font-medium">
                      <button className="flex gap-1 items-center">
                        Vol <ChevronsUpDownIcon width={14} height={14} />
                      </button>
                    </TableHead>                    
                    <TableHead className=""></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedChain === "sui" &&
                    tokenInfoSuiList.map((token: TokenInfoSui, index) => {
                      return (
                        <TableRow
                          key={index}
                          className="hover:bg-blue-900 transition-colors duration-150 group"
                          onClick={() => clickHandler(token)}
                        >
                          <TableCell className="sticky left-0 z-20 bg-[#0e203f] group-hover:bg-blue-900 transition-colors duration-150">
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                {/* Wrap the date cell content with a Tooltip */}
                                <TooltipTrigger asChild>
                                  <Image
                                    src="/dexes/sui_dex.png"
                                    alt="sui_dex"
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="p-1.5 text-xs bg-gray-50 text-gray-900">
                                  Sui Dex
                                </TooltipContent>
                              </Tooltip>
                              {/* Token info cell content */}
                              <div className="flex items-center gap-2">
                                <img
                                  src={token.token_metadata?.iconUrl}
                                  alt=""
                                  className="h-8 w-8 rounded-full"
                                />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-400">
                                      {token.token_metadata?.symbol}
                                    </span>
                                    <button
                                      className={`${
                                        copiedTokenIds.has(token.token_address)
                                          ? "text-green-500"
                                          : "text-gray-500"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyAddress(token);
                                      }}
                                    >
                                      {!copiedTokenIds.has(token.symbol) ? (
                                        <CopyIcon width={12} height={12} />
                                      ) : (
                                        <ClipboardCheckIcon
                                          width={12}
                                          height={12}
                                        />
                                      )}
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                      {token.created_by &&
                                        formatAddress(token.created_by)}
                                    </span>
                                    {token.website && (
                                      <button
                                        className="text-gray-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(
                                            token.website,
                                            "_blank",
                                            "noopener noreferrer"
                                          );
                                        }}
                                      >
                                        <GlobeIcon width={12} height={12} />
                                      </button>
                                    )}
                                    {token.twitter && (
                                      <button
                                        className="text-gray-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(
                                            token.twitter,
                                            "_blank",
                                            "noopener noreferrer"
                                          );
                                        }}
                                      >
                                        <Twitter />
                                      </button>
                                    )}
                                    {token.telegram && (
                                      <button
                                        className="text-gray-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(
                                            token.telegram,
                                            "_blank",
                                            "noopener noreferrer"
                                          );
                                        }}
                                      >
                                        <SendIcon width={12} height={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              {/* Wrap the date cell content with a Tooltip */}
                              <TooltipTrigger asChild>
                                {/* Use TooltipTrigger for accessibility */}
                                <span className="text-green-400 font-medium text-[15px] cursor-pointer">
                                  {/* Make it look clickable */}
                                  {token.created_at &&
                                    calculateDaysSinceCreation(
                                      token.created_at
                                    )}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-50 text-gray-900">
                                {/* Tooltip content shows the original date */}
                                {token.created_at &&
                                  format(
                                    new Date(token.created_at),
                                    "yyyy-MM-dd"
                                  )}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex text-gray-400 font-bold text-[15px]">
                                  $
                                  {token.token_price_usd && (
                                    <PriceFormatter
                                      price={token.token_price_usd}
                                    />
                                  )}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-50 text-gray-900">
                                {formatTokenPrice(token.token_price_usd)}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-400 font-semibold text-[15px]">
                              {token.market_cap_sui
                                ? formatVolume(token.market_cap_usd)
                                : "--"}
                            </span>
                          </TableCell>                         
                          <TableCell>
                            <span className="text-sky-600 font-bold text-[15px]">
                              ${formatVolume(+token.volume_usd)}
                            </span>
                          </TableCell>                          
                          <TableCell className="flex items-center gap-3">
                          <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Use handleBuy instead of navigation
                                if (selectedChain === 'sui') {
                                  const isMobile = window.matchMedia("(max-width: 767px)").matches;
                                  if (isMobile) {
                                    handleBuyMobile(token as TokenInfoSui);
                                  } else {
                                    handleBuy(token as TokenInfoSui);
                                  }
                                } else {
                                  clickHandler(token);
                                }
                              }}
                              className="px-5 flex items-center bg-transparent hover:bg-bluesky text-[#8899A8] hover:text-gray-50 border border-bluesky"
                            >
                              <Image
                                src="/flash.png"
                                alt="flash"
                                width={20}
                                height={20}
                              />
                              <span className="text-[15px] font-medium">
                                Buy
                              </span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                predictionHandler(
                                  token.token_metadata.name,
                                  token.token_metadata.symbol
                                );
                              }}
                              className="px-2.5 bg-transparent hover:bg-bluesky text-yellow-400 border border-bluesky rounded-full"
                            >
                              <SparklesIcon />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </>
            )}
          </Table>
          {isPredictionLoading && !pricePrediction && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            </div>
          )}
          {!isPredictionLoading && pricePrediction && (
            <PricePredictionModal
              isOpen={isPredictionOpen}
              onClose={() => setIsPredictionOpen(false)}
              data={pricePrediction}
            />
          )}
          <ScrollBar orientation="horizontal" />
          <div className="hidden md:flex justify-center items-center p-4 w-full bg border-t border-[#132D5B]">
            {hasMore && (
              <Button
                variant="outline"
                size="lg"
                onClick={fetchTokenInfoList}
                disabled={isLoading}
                className="bg-blue-950 hover:bg-blue-900 text-gray-100 hover:text-gray-100 border-gray-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            )}
          </div>
        </ScrollArea>
      </div>      

      {hasMore && (
        <Button
          variant="outline"
          size="lg"
          onClick={fetchTokenInfoList}
          disabled={isLoading}
          className="md:hidden bg-blue-950 hover:bg-blue-900 text-gray-100 hover:text-gray-100 border-gray-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            "Load More"
          )}
        </Button>
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
    </>
  );
}

export const LoadingRow = () => (
  <TableRow className="bg hover:bg-transparent">
    <TableCell colSpan={7} className="p-0">
      <Skeleton className="h-12 w-full rounded-none bg-gray-600 mb-1.5" />
    </TableCell>
  </TableRow>
);

const ErrorAlert = ({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) => (
  <Alert variant="destructive" className="my-4">
    <AlertTitle>Error</AlertTitle>
    <AlertDescription className="flex flex-col gap-2">
      <p>{message}</p>
      <button
        onClick={retry}
        className="text-sm underline hover:text-red-400 w-fit"
      >
        Try again
      </button>
    </AlertDescription>
  </Alert>
);

// Utility Components
const calculateDaysSinceCreation = (cdate: string): string => {
  try {
    const date = new Date(cdate);
    return formatDistanceToNowStrict(date, { addSuffix: false }); // Use strict mode
  } catch (error) {
    console.error("Error parsing date:", error);
    return "Invalid date"; // Or a suitable fallback
  }
};
