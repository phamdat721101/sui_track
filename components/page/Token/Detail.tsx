import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  ExternalLink,
  Globe,
  MessageCircle,
  Timer,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import GlobalContext from "../../../context/store";
import { Progress } from "../../ui/Progress";
import TabDetail from "./TabDetail";
import {
  formatTokenPrice,
  isMovefunTokenInfo,
  isTokenInfo,
} from "../../../types/helper";
import { PriceFormatter } from "../PriceFormatter";
import TokenSwap from "./Swap";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { TokenInfo, TokenInfoSui, TokenMoveFunInfo } from "@/types/interface";

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toFixed(2).toString();
};

const tabs = ["1M", "5M", "1H", "24H"];

export default function Detail() {
  const { selectedToken } = useContext(GlobalContext);
  const params = useParams<{ id: string }>();
  const [tokenData, setTokenData] = useState();
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const url = `${
        process.env.NEXT_PUBLIC_TRACKIT_API_HOST
      }/token/info?token=${decodeURIComponent(params.id)}`;
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          const data = response.data.tokenData;
          setTokenData(() => {
            return {
              ...data,
            };
          });
        }
      } catch (error) {
        console.log("Failed to fetch token data");
      }
    };

    fetchToken();
  }, []);

  const clickHandler = (
    token: TokenInfo | TokenInfoSui | TokenMoveFunInfo | null
  ) => {
    if (!token) return;

    if (isTokenInfo(token)) {
      router.push(`#`);
    } else if (isMovefunTokenInfo(token)) {
      window.open(token.pool_url || `#`, "_blank");
    } else {
      router.push(`#`);
    }
  };

  return (
    <div className="p-4 bg rounded-lg space-y-4">
      <Card className="p-4 bg-items text-white border-itemborder">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Image
              src={
                selectedToken &&
                (isTokenInfo(selectedToken) ||
                  isMovefunTokenInfo(selectedToken))
                  ? selectedToken.image
                  : selectedToken?.token_metadata.iconUrl || ""
              }
              alt={selectedToken?.name || ""}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-bold">
                {selectedToken
                  ? isTokenInfo(selectedToken)
                    ? selectedToken.tickerSymbol
                    : isMovefunTokenInfo(selectedToken)
                    ? selectedToken.symbol
                    : selectedToken.token_metadata.symbol
                  : ""}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedToken?.name}
              </p>
            </div>
          </div>
          <Link
            href={
              `https://app.turbos.finance/fun/#/fun/${decodeURIComponent(params.id)}`
            }
            target="_blank"
            className="text-blue-500 hover:text-blue-600"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">PRICE USD</div>
              <div className="text-base font-bold">
                $
                {selectedToken ? (
                  isTokenInfo(selectedToken) ? (
                    <PriceFormatter price={selectedToken.aptosUSDPrice || 0} />
                  ) : isMovefunTokenInfo(selectedToken) ? (
                    <PriceFormatter
                      price={selectedToken.marketData.tokenPriceUsd || 0}
                    />
                  ) : (
                    <PriceFormatter
                      price={selectedToken?.token_price_usd || 0}
                    />
                  )
                ) : (
                  0
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">PRICE</div>
              <div className="text-base font-bold">
                {selectedToken ? (
                  isTokenInfo(selectedToken) ? (
                    <>
                      <PriceFormatter
                        price={selectedToken.aptosUSDPrice || 0}
                      />
                      MOV
                    </>
                  ) : isMovefunTokenInfo(selectedToken) ? (
                    <>
                      <PriceFormatter
                        price={selectedToken?.marketData.tokenPriceUsd || 0}
                      />
                      MOV
                    </>
                  ) : (
                    <>
                      <PriceFormatter
                        price={selectedToken?.token_price_sui || 0}
                      />
                      SUI
                    </>
                  )
                ) : (
                  0
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">LIQUIDITY</div>
              <div className="font-bold">$1.5M</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">FDV</div>
              <div className="font-bold">$38.4M</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">MKT CAP</div>
              <div className="font-bold">
                $
                {selectedToken
                  ? isTokenInfo(selectedToken)
                    ? formatVolume(selectedToken.marketCapUSD || 0)
                    : isMovefunTokenInfo(selectedToken)
                    ? formatVolume(selectedToken.marketData.marketCap || 0)
                    : formatVolume(selectedToken.market_cap_usd || 0)
                  : 0}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-items text-white border-itemborder">
        <Tabs defaultValue="24H" className="w-full">
          <TabsList className="grid grid-cols-4 p-0 text-center bg-transparent">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={tab}
                className="grid data-[state=active]:bg-itemborder data-[state=active]:text-gray-50 h-fit rounded-lg data-[state=active]:rounded-none data-[state=active]:first:rounded-ss-lg data-[state=active]:last:rounded-se-lg"
              >
                <span>{tab}</span>
                <span className="text-green-500 font-bold">0.11%</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab, index) => (
            <TabsContent key={index} value={tab} className="w-full p-4">
              <TabDetail />
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      <Button
        className="w-full h-10 text-sm font-semibold bg-transparent border border-bluesky text-bluesky hover:bg-blue-500 hover:text-white"
        onClick={() => clickHandler(selectedToken)}
      >
        <ArrowRightLeft className="w-5 h-5 mr-2" />
        TRADE NOW !
      </Button>
      {/* <TokenSwap token={selectedToken} /> */}

      <Card className="p-3 bg-items text-white border-itemborder text-sm space-y-3">
        <h2>Pool info</h2>
        <div className="grid gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total liquid</span>
            <span>$1.5M</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Market cap</span>
            <span>$28.90K</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Holders</span>
            <span>100</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total supply</span>
            <span>100B</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Pair</span>
            <span>Cv1bJ...x9N</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Creator</span>
            <span>J45yp...rWm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Created</span>
            <span>11/28/2024 13:11</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
