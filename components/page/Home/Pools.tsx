"use client";

import { ArrowRightLeftIcon, Loader2, MinusIcon, PlusIcon } from "lucide-react";
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
import { Pool } from "../../../types/interface";
import { useRouter } from "next/navigation";

export default function Pools() {
  const { selectedChain } = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("swap");
  const [poolData, setPoolData] = useState<Pool[]>([]);
  const router = useRouter();
  const limitPool = 3;

  const clickHandler = () => {
    router.push(`/tracker`);
  };

  const onOpenSwap = () => {
    setShowDialog(true);
    setSelectedTab("swap");
  };

  const onOpenAddLiquidity = () => {
    setShowDialog(true);
    setSelectedTab("add");
  };

  const onOpenRemoveLiquidity = () => {
    setShowDialog(true);
    setSelectedTab("remove");
  };

  useEffect(() => {
    const fetchPools = async () => {
      const url = `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/yield/pools?chain=${selectedChain}&limit=${limitPool}`;
      try {
        const response = await axios.get(url);

        if (response.status === 200) {
          console.log("Fetch pools : ", response)
          if (response.data) {                    
            setPoolData(() => [...response.data]);
          } else {
            console.log("API response data is empty.");
          }
        } else {
          console.log("Failed to fetch data: ", response.status);
        }
      } catch (error) {
        console.log("Error fetching pools:", error);
      }
    };

    fetchPools();
  }, [selectedChain]);

  return (
    <div className="w-full flex justify-center">
      <div className="flex-1 max-w-5xl overflow-hidden">
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
                    <TableHead className="sticky left-0 z-20 bg-[#0e203f] min-w-32 text-gray-400 font-medium">
                      Pool
                    </TableHead>
                    <TableHead className="min-w-32 text-gray-400 font-medium">
                      TVL
                    </TableHead>
                    <TableHead className="min-w-32 text-gray-400 font-medium">
                      APR
                    </TableHead>
                    <TableHead className="min-w-28 text-gray-400 font-medium">
                      Add liquid.
                    </TableHead>
                    <TableHead className="min-w-28 text-gray-400 font-medium">
                      Remove liquid.
                    </TableHead>
                    <TableHead className="min-w-28 text-gray-400 font-medium">
                      Swap
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poolData.length === 0 &&
                    [...Array(1)].map((_, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-blue-900 transition-colors duration-150 group"
                      >
                        <TableCell className="sticky left-0 z-20 bg-[#0e203f] group-hover:bg-blue-900 transition-colors duration-150">
                          SUI/USDC
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="px-5 flex items-center bg-transparent hover:bg-bluesky text-bluesky hover:text-gray-50 border border-bluesky"
                            onClick={onOpenAddLiquidity}
                          >
                            <PlusIcon />
                            <span className="text-[15px] font-medium">Add</span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="px-5 flex items-center bg-transparent hover:bg-bluesky text-bluesky hover:text-gray-50 border border-bluesky"
                            onClick={onOpenRemoveLiquidity}
                          >
                            <MinusIcon />
                            <span className="text-[15px] font-medium">
                              Remove
                            </span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="px-5 flex items-center bg-transparent hover:bg-bluesky text-bluesky hover:text-gray-50 border border-bluesky"
                            onClick={onOpenSwap}
                          >
                            <ArrowRightLeftIcon />
                            <span className="text-[15px] font-medium">
                              Swap
                            </span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {poolData.length > 0 &&
                    poolData.map((item, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-blue-900 transition-colors duration-150 group"
                        onClick={clickHandler}
                      >
                        <TableCell className="sticky left-0 z-20 bg-[#0e203f] group-hover:bg-blue-900 transition-colors duration-150">
                          {item.pool?.symbol || "N/A"}
                        </TableCell>
                        <TableCell>
                          ${formatVolume(item.pool?.tvl) || "-"}
                        </TableCell>
                        <TableCell>{item.pool.apr.toFixed(3)}%</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="px-5 flex items-center bg-transparent hover:bg-bluesky text-[#8899A8] hover:text-gray-50 border border-bluesky"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAddLiquidity();
                            }}
                          >
                            <PlusIcon />
                            <span className="text-[15px] font-medium">Add</span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="px-5 flex items-center bg-transparent hover:bg-bluesky text-[#8899A8] hover:text-gray-50 border border-bluesky"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenRemoveLiquidity();
                            }}
                          >
                            <MinusIcon />
                            <span className="text-[15px] font-medium">
                              Remove
                            </span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="px-5 flex items-center bg-transparent hover:bg-bluesky text-[#8899A8] hover:text-gray-50 border border-bluesky"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSwap();
                            }}
                          >
                            <ArrowRightLeftIcon />
                            <span className="text-[15px] font-medium">
                              Swap
                            </span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </>
            )}
          </Table>

          <ScrollBar orientation="horizontal" />
          <div className="hidden md:flex justify-center items-center p-4 w-full bg border-t border-[#132D5B]">
            {hasMore && (
              <Button
                variant="outline"
                size="lg"
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

      <OperationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        initialTab={selectedTab}
      />

      {hasMore && (
        <Button
          variant="outline"
          size="lg"
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
    </div>
  );
}
