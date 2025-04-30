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

const list = {
  MOVE: 0.5,
  ETH: 2000,
  APT: 5,
};

export function useTokenPrices(tokens: Token[]) {
  const [prices, setPrices] = useState<Record<string, number>>(list);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    if (!tokens.length) return;

    try {
      setLoading(true);

      // Fetch prices
      const response = await fetch("YOUR_PRICE_API");
      if (response.ok) {
        const data = await response.json();
        setPrices(data);
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchPrices();

    // Setup interval to update prices
    const interval = setInterval(fetchPrices, 30000); // 30s
    return () => clearInterval(interval);
  }, [tokens]);

  return { prices, loading, refreshPrices: fetchPrices };
}
