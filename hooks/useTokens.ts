import { useEffect, useState } from "react";

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  price: number;
  icon: string;
  address: string;
}

// Mock token data
const list: Token[] = [
  {
    id: "sui",
    name: "SUI",
    symbol: "SUI",
    balance: "0",
    price: 0.5,
    icon: "/chains/sui.svg",
    address: "0x1::aptos_coin::AptosCoin",
  },
  {
    id: "usdc",
    name: "USDC",
    symbol: "USDC",
    balance: "0",
    price: 5,
    icon: "/usdc-logo.svg",
    address: "0x1::aptos_coin::AptosCoin",
  },
];

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>(list);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      setLoading(true);

      // Call api to fetch tokens
      const response = await fetch("YOUR_TOKEN_LIST_API");
      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      }
    } catch (error) {
      console.log("Failed to fetch tokens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return { tokens, loading, refreshTokens: fetchTokens };
}
