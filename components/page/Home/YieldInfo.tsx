import { Card } from "../../ui/Card";
import { Badge } from "../../ui/badge";
import {
  ChevronRight,
  Clock4,
  CircleDollarSignIcon,
  ArrowRightLeftIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PoolInfo, SwapPool } from "../../../types/interface";

export default function YieldInfo() {
  const [swapPools, setSwapPools] = useState<SwapPool[]>([]);
  const [earnPools, setEarnPools] = useState<PoolInfo[]>([]);

  useEffect(() => {
    const fetchSwapPools = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/yield/info?chain=kaia`
        );
        const result = await response.json();
        setSwapPools(result);
      } catch (error) {
        console.log("Failed to fetch swap pools");
      }
    };

    const fetchEarnPools = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/yield/info?chain=kaia&token=kaia`
        );
        const result = await response.json();
        setEarnPools(result);
      } catch (error) {
        console.log("Failed to fetch earn pools");
      }
    };

    fetchSwapPools();
    fetchEarnPools();
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8">
      {/* Swap Section */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-pink-500">
          <ArrowRightLeftIcon />
          <h2 className="text-xl font-semibold text-gray-50">Swap</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {swapPools.length > 0 ? (
            swapPools.map((pool) => (
              <Card
                key={pool.id}
                className="flex items-center p-4 hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="relative flex items-center flex-1">
                  <div className="relative w-12 h-12">
                    <Image
                      src={pool.attributes.logo.data.attributes.url}
                      alt={pool.attributes.title}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{pool.attributes.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pool.attributes.description_en}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Card>
            ))
          ) : (
            <span>No pools</span>
          )}
        </div>
      </section>

      {/* Earn Section */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-green-500">
          <CircleDollarSignIcon />
          <h2 className="text-xl font-semibold text-gray-50">Earn</h2>
          <div className="flex items-center gap-1 ml-auto text-sm text-muted-foreground">
            <Clock4 className="w-4 h-4" />
            <span>Last update: 2025-01-09 14:34</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {earnPools.length > 0 ? (
            earnPools.map((pool) => (
              <Card
                key={pool.protocol}
                className="flex items-center p-4 hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="relative flex items-center flex-1">
                  <div className="relative w-12 h-12">
                    <Image
                      src="/logo.png"
                      alt={pool.protocol}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{pool.protocol}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Est.APY
                      </span>
                      <span className="font-medium">
                        {pool.apr}
                        {pool.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Card>
            ))
          ) : (
            <span>No pools</span>
          )}
        </div>
      </section>
    </div>
  );
}
