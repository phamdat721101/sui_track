import { getBalance } from "@/components/warpgate";
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
  MOVE: "0",
  ETH: "0",
  APT: "0",
};

export function useTokenBalances(account: string | undefined, tokens: Token[]) {
  const [balances, setBalances] = useState<Record<string, string>>(list);
  const [loading, setLoading] = useState(true);

  const fetchBalances = async () => {
    if (!account || !tokens.length) return;

    try {
      setLoading(true);
      const newBalances: Record<string, string> = {};

      // Fetch balances
      await Promise.all(
        tokens.map(async (token) => {
          const balance = await getBalance(
            account,
            `0x1::coin::CoinStore<${token.address}>`
          );
          newBalances[token.symbol] = balance.toString();
        })
      );

      setBalances(newBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [account, tokens]);

  return { balances, loading, refreshBalances: fetchBalances };
}
