import { ArrowUpRight, Globe, X, ZapIcon } from "lucide-react";
import Image from "next/image";
import { Card } from "../../ui/Card";

interface TokenCardProps {
  icon: string;
  name: string;
  title: string;
  description: string;
  percentage: number;
  price: string;
  transactions: number;
  volume: string;
  time: string;
}

export function TokenCard({
  icon,
  name,
  title,
  description,
  percentage,
  price,
  transactions,
  volume,
  time,
}: TokenCardProps) {
  return (
    <Card className="bg-[#0e203f] text-gray-300 overflow-hidden border-itemborder">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden">
              <Image
                src={icon || "/placeholder.svg"}
                alt={name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">{name}</span>
                <span className="text-white">{title}</span>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2">
                {description}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Globe className="h-4 w-4 text-zinc-400" />
            <X className="h-4 w-4 text-zinc-400" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-semibold">
                {percentage}%
              </span>
              <span className="text-gray-300 font-semibold">{price}</span>
              <div className="flex items-center gap-0.5 text-yellow-400">
                <ZapIcon strokeWidth={1} width={14} height={14} />
                <span>500</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span>{time}</span>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>{transactions} txns</span>
              </div>
              <span>{volume} vol</span>
            </div>
          </div>
          <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7cff98] rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
