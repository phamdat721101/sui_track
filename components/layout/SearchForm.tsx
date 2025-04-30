import React, { useState } from "react";
import { Clock, AlertCircle, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// Mock data - replace with your actual API data
const exchangeData = [
  {
    name: "Binance",
    rate: 2.83927341,
    eta: "5-45 min",
    kycRisk: "Low",
    tag: "Trusted partner",
    tagColor: "text-green-400 bg-green-400/10",
  },
  {
    name: "EasyBit",
    rate: 2.84381467,
    eta: "5-45 min",
    kycRisk: "Medium",
    tag: "Best rate",
    tagColor: "text-yellow-400 bg-yellow-400/10",
  },
  {
    name: "ChangeHero",
    rate: 2.8437469347,
    eta: "5-30 min",
    kycRisk: "Low",
    tag: "Fastest",
    tagColor: "text-blue-400 bg-blue-400/10",
  },
  {
    name: "Changelly",
    rate: 2.84136667,
    eta: "5-35 min",
    kycRisk: "Medium",
    tag: "",
    tagColor: "",
  },
  {
    name: "ChangeHero",
    rate: 2.8437469347,
    eta: "5-30 min",
    kycRisk: "Low",
    tag: "Fastest",
    tagColor: "text-blue-400 bg-blue-400/10",
  },
  {
    name: "Changelly",
    rate: 2.84136667,
    eta: "5-35 min",
    kycRisk: "Medium",
    tag: "",
    tagColor: "",
  },
];

interface ResponseProps {
  srcAsset: string;
  dstAsset: string;
  srcAmount: string;
  dstAmount: string;
  feeAmount: string;
  isFeeIn: boolean;
  paths: Path[][];
}

interface Path {
  poolId: string;
  source: string;
  srcAsset: string;
  dstAsset: string;
  srcAmount: number;
  dstAmount: number;
}

export default function SearchForm() {
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Path[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    // Filter results based on search value
    // const filtered = exchangeData.filter((exchange) =>
    //   exchange.name.toLowerCase().includes(searchValue.toLowerCase())
    // );
    // setResults(filtered);
    try {
      if (!searchValue.trim()) {
        throw new Error("Please enter a token address");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/token/route?src_adr=0x1::aptos_coin::AptosCoin&dst_adr=${searchValue}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ResponseProps = await response.json();

      if (!data.paths) return;
      setResults(data.paths[0]);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400"
            strokeWidth={1}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search"
            className="w-full pl-12 pr-4 py-2 rounded-3xl bg-[#102447] text-gray-500 focus:outline-none focus:border-gray-600 text-sm"
          />
        </div>
        {error && <div className="text-rose-500 text-sm">{error}</div>}
      </form>

      {/* Results Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 text-gray-100 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Search Results</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4 pr-2.5 overflow-auto min-h-[150px]">
            {isLoading && (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            )}
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No exchanges found
              </div>
            ) : (
              results.map((exchange, index) => (
                <div
                  key={index}
                  className="relative p-4 rounded-xl bg-gray-800/50 border border-gray-700/50"
                >
                  {/* Exchange Header */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium text-gray-100">
                      {exchange.source}
                    </span>
                    {/* {exchange.tag && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${exchange.tagColor}`}
                      >
                        {exchange.tag}
                      </span>
                    )} */}
                  </div>

                  <div className="flex justify-between items-center">
                    {/* Exchange Details */}
                    <div className="space-y-2">
                      {/* Rate */}
                      <div className="flex items-center text-gray-300">
                        <span className="text-sm mr-2">Rate</span>
                        <span className="text-gray-100">1 APT ~8.00 USDC</span>
                      </div>

                      {/* ETA and KYC Risk */}
                      <div className="flex items-center space-x-6">
                        {/* ETA */}
                        <div className="flex items-center text-gray-300">
                          <Clock className="h-4 w-4 mr-1 opacity-50" />
                          <span className="text-sm">5-45 mins</span>
                        </div>

                        {/* Risk */}
                        <div className="flex items-center">
                          <span className="text-sm text-gray-300 mr-2">
                            Risk
                          </span>
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 opacity-50" />
                            <span
                              className={`text-sm ${
                                "Low" === "Low"
                                  ? "text-green-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              Low
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exchange Button */}
                    <button className="px-4 py-2 rounded-lg bg-transparent border border-rose-500/50 text-rose-500 hover:bg-rose-500/10 transition-colors">
                      Exchange
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
