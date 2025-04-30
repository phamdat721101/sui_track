"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronsUpDownIcon, Filter } from "lucide-react";
import { useParams } from "next/navigation";
import { TxnInfo } from "../../../types/interface";
import axios from "axios";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";

interface Trade {
  date: string;
  type: string;
  usd: string;
  cell: string;
  apt: string;
  price: string;
  maker: string;
}

const trades: Trade[] = [
  {
    date: "Nov 21 11:49:38 PM",
    type: "Buy",
    usd: "<0.01",
    cell: "0.2650",
    apt: "0.0006400",
    price: "0.02902",
    maker: "5a1b1d",
  },
  {
    date: "Nov 21 11:45:45 PM",
    type: "Sell",
    usd: "16.01",
    cell: "550.00",
    apt: "1.32",
    price: "0.02912",
    maker: "77e786",
  },
  {
    date: "Nov 21 11:43:45 PM",
    type: "Sell",
    usd: "0.87",
    cell: "30.10",
    apt: "0.07255",
    price: "0.02911",
    maker: "16651c",
  },
  {
    date: "Nov 21 11:41:20 PM",
    type: "Buy",
    usd: "0.02",
    cell: "0.7288",
    apt: "0.001760",
    price: "0.02909",
    maker: "a5b899",
  },
  {
    date: "Nov 21 11:41:16 PM",
    type: "Buy",
    usd: "0.02",
    cell: "0.7288",
    apt: "0.001760",
    price: "0.02909",
    maker: "92d5c",
  },
  {
    date: "Nov 21 11:39:01 PM",
    type: "Buy",
    usd: "14.52",
    cell: "496.94",
    apt: "1.20",
    price: "0.02921",
    maker: "b95781",
  },
];

const header_table = [
  "Date",
  "Type",
  "x Amount",
  "y Amount",
  "Maker",
  "TxHash",
];

export default function TxHistory() {
  const params = useParams<{ id: string }>();
  const [txnData, setTxnData] = useState<TxnInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenInfoList = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_TRACKIT_API_HOST
          }/token/txs?token=${decodeURIComponent(params.id)}`
        );
        if (response.status === 200) {
          console.log("Txn data: ", response.data)
          const data: TxnInfo[] = response.data;
          // console.log(data);
          setTxnData(data);
        }
      } catch (err) {
        setError("Failed to fetch governance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenInfoList();
  }, [params.id]);

  return (
    <div className="w-full mx-auto text-gray-100 rounded-lg">
      {/* Container with fixed height and overflow handling */}
      <div className="relative rounded-lg">
        {/* Table container with sticky header */}
        <div className="overflow-x-auto">
          <ScrollArea className="overflow-y-auto max-h-[200px] rounded-lg">
            {/* Adjust max-h value based on your needs */}
            <Table className="min-w-full table">
              <TableHeader className="sticky top-0 bg z-10">
                <TableRow className="text-sm hover:bg-transparent">
                  {header_table.map((header) => (
                    <TableHead
                      key={header}
                      className="min-w-40 px-4 py-2 text-left font-medium text-gray-400"
                    >
                      <button className="flex items-center">
                        {header} <ChevronsUpDownIcon width={14} height={14} />
                      </button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-700 bg">
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="px-4 py-4 text-center text-gray-400"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : txnData.length > 0 ? (
                  txnData.map((trade, index) => (
                    <TableRow
                      key={index}
                      className="text-sm hover:bg-blue-900 transition-colors"
                    >
                      <TableCell className="px-4 py-2 whitespace-nowrap">
                        {format(
                          new Date(+trade.timestamp / 1000),
                          "yyyy-MM-dd HH:mm:ss"
                        )}
                      </TableCell>
                      <TableCell
                        className={`px-4 py-2 whitespace-nowrap ${
                          trade.side === "BUY"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {trade.side}
                      </TableCell>
                      {/* <td
                  className={`px-4 py-2 ${
                    trade.usd.startsWith("<")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {trade.usd}
                </td> */}
                      <TableCell className="px-4 py-2 whitespace-nowrap">
                        {(+trade.xAmt).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="px-4 py-2 whitespace-nowrap">
                        {(+trade.yAmt).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      {/* <td
                  className={`px-4 py-2 whitespace-nowrap ${
                    trade.price.startsWith("0.02")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {trade.price}
                </td> */}
                      <TableCell className="px-4 py-2 whitespace-nowrap">
                        {formatAddress(trade.userWalletAddr)}
                      </TableCell>
                      <TableCell className="px-4 py-2 whitespace-nowrap">
                        {formatAddress(trade.txnHash)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="px-4 py-4 text-center text-gray-400"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function formatAddress(address: string): string {
  return `${address.slice(-6)}`;
}
