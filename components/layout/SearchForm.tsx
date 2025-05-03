import React, { useState } from "react";
import { Clock, AlertCircle, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/Button";

interface TokenResult {
  symbol: string;
  age: string;
  address: string;
  volume24h: string;
  liq: string;
  marketCap: string;
  change24h: string;
  iconUrl: string;
  chainColor: string;
}

export default function SearchForm() {
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<TokenResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mockResults: TokenResult[] = [
    {
      symbol: "PQDQ",
      age: "102d",
      address: "0x567...07c",
      volume24h: "$0",
      liq: "$0.009",
      marketCap: "$7.22e",
      change24h: "29.0%",
      iconUrl: "/token-placeholder.png",
      chainColor: "#3C3C3D",
    },
    {
      symbol: "PQD Q",
      age: "158d",
      address: "0x8ca...e80",
      volume24h: "$0",
      liq: "$279.38",
      marketCap: "$587K",
      change24h: "-0.63%",
      iconUrl: "/token-placeholder.png",
      chainColor: "#627EEA",
    },
    {
      symbol: "PQD",
      age: "135d",
      address: "0x5RS...ump",
      volume24h: "$0",
      liq: "$4,118.56",
      marketCap: "$7,247.48",
      change24h: "0%",
      iconUrl: "/token-placeholder.png",
      chainColor: "#8C8C8C",
    },
    // ...add more mocks as needed
  ];

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!searchValue.trim()) {
      setError("Please enter a token symbol or address");
      setIsLoading(false);
      return;
    }

    try {
      // ** Replace this with your real API call later **
      await new Promise((r) => setTimeout(r, 500));
      setResults(mockResults);
      setIsOpen(true);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400"
          strokeWidth={1}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search token symbol or address"
          className="w-full pl-12 pr-4 py-2 rounded-full bg-[#102447] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3c78] text-sm"
        />
        {error && <div className="text-rose-500 text-sm mt-1">{error}</div>}
      </form>

      {/* Results Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0e203f] text-gray-100 rounded-lg w-full max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-[#132d5b] px-4 py-3 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Search Results</DialogTitle>
            <X
              className="h-5 w-5 cursor-pointer text-gray-300 hover:text-white"
              onClick={() => setIsOpen(false)}
            />
          </DialogHeader>

          <div className="divide-y divide-gray-700 max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-gray-400">Loading…</div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-gray-400">No tokens found</div>
            ) : (
              results.map((token, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-[#1a2a4a]"
                >
                  {/* Left: Icon + Symbol / Age / Address */}
                  <div className="flex items-center w-full sm:w-1/3">
                    <div
                      className="h-10 w-10 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: token.chainColor }}
                    >
                      <img
                        src={token.iconUrl}
                        alt={token.symbol}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-white">{token.symbol}</div>
                      <div className="text-xs text-gray-400 flex items-center space-x-2">
                        <span>{token.age}</span>
                        <span className="truncate">{token.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Volume, Liquidity, Market Cap */}
                  <div className="flex justify-between w-full sm:w-1/3 mt-3 sm:mt-0 text-xs text-gray-300">
                    <div className="flex flex-col items-start">
                      <span className="text-gray-400">24h Vol</span>
                      <span className="text-gray-100">{token.volume24h}</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-gray-400">Liq</span>
                      <span className="text-gray-100">{token.liq}</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-gray-400">MC</span>
                      <span className="text-gray-100">{token.marketCap}</span>
                    </div>
                  </div>

                  {/* Right: 24h Change */}
                  <div className="mt-3 sm:mt-0 w-full sm:w-1/6 flex items-center justify-end">
                    <span
                      className={`text-sm font-semibold ${
                        token.change24h.startsWith("-") ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {token.change24h}
                    </span>
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
