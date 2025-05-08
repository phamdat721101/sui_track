"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Position } from "../types/interface";

interface PortfolioResult {
  data: Position[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * usePortfolioData hooks fetches user token balances and liquidity positions
 * @param walletAddress user's wallet address (string | undefined)
 * @returns data, isLoading, hasMore, loadMore
 */
export default function usePortfolioData(
  walletAddress?: string
): PortfolioResult {
  const [data, setData] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (!walletAddress || isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      // Example API endpoint; adjust path as needed
      const limit = 10;
      const res = await axios.get<{ positions: Position[]; hasMore: boolean }>(
        `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/portfolio`,
        {
          params: {
            address: walletAddress,
            page,
            limit,
          },
        }
      );
      const { positions, hasMore: more } = res.data;
      setData(prev => [...prev, ...positions]);
      setHasMore(more);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error("Failed to load portfolio data", err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, page, isLoading, hasMore]);

  // reset on wallet change
  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    if (walletAddress) {
      loadMore();
    }
  }, [walletAddress]);

  return { data, isLoading, hasMore, loadMore };
}

export type { PortfolioResult };
