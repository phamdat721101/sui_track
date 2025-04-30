import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/badge";
import { TrendingUp, DollarSign, Users, ExternalLink } from "lucide-react";
import { TokenInfo } from "@/types/interface";
import { useContext } from "react";
import GlobalContext from "@/context/store";
import Link from "next/link";

type Props = {
  info: TokenInfo;
};

const Item: React.FC<Props> = ({ info }) => {
  const { setSelectedToken } = useContext(GlobalContext);

  const clickHandler = (info: TokenInfo) => {
    setSelectedToken(info);
  };

  return (
    <Link href={`/token/${info.mintAddr}`}>
      <button className="w-full" onClick={() => clickHandler(info)}>
        <Card
          key={info.id}
          className="mt-2 ml-2 mr-2.5 block rounded-lg bg-item overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:bg-gray-700 text-gray-50 border border-itemborder "
        >
          <CardHeader className="px-6 py-3">
            <CardTitle className="flex items-center justify-between text-gray-50 text-lg">
              <div className="flex items-center mb-3">
                <Image
                  src={info.image || ""}
                  alt={info.name || ""}
                  width={80}
                  height={80}
                  className="rounded-full border-1 border-bluesky shadow-lg"
                />
                <div className="ml-4">
                  <span className="font-bold">{info.name}</span>

                  <p className="text-xs font-medium text-gray-400">
                    Created by
                  </p>
                  <p className="text-base font-semibold text-gray-100">
                    {info.creatorName}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="text-xs font-semibold bg-gray-100 text-gray-400"
              >
                {info.tickerSymbol}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-3">
            <p className="text-sm text-gray-400 mb-3 text-wrap">{info.desc}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <TrendingUp className="text-green-400 mr-3" size={24} />
                <div>
                  <p className="text-xs text-gray-400">Market Cap</p>
                  <p className="font-semibold text-base">
                    $
                    {info.marketCapUSD
                      ? info.marketCapUSD.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : "--"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="text-bluesky mr-3" size={24} />
                <div>
                  <p className="text-xs text-gray-400">Price</p>
                  <p className="font-semibold text-base">
                    $
                    {info.aptosUSDPrice
                      ? info.aptosUSDPrice.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : "--"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-6 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Users className="text-bluesky mr-2" size={18} />
              <span className="text-xs font-medium text-gray-400">
                {info.holderPercentage}% Holders
              </span>
            </div>
            {/* <Link href={`/token/${info.mintAddr}`}>
          <Button
            variant="outline"
            className="bg-transparent border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white transition-colors duration-300 text-xs"
            onClick={() => clickHandler(info)}
          >
            View Details
            <ExternalLink className="ml-2" size={16} />
          </Button>
        </Link> */}
          </CardFooter>
        </Card>
      </button>
    </Link>
  );
};

export default Item;
