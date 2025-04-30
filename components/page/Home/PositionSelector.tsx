"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "../../ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/Popover";
import { ChevronDown } from "lucide-react";

type LiquidityPosition = {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  token1: {
    symbol: string;
    icon: string;
    amount: string;
    value: number;
  };
  token2: {
    symbol: string;
    icon: string;
    amount: string;
    value: number;
  };
  totalValue: number;
  share: string;
  icon: string;
};

interface LiquidityPositionSelectorProps {
  selectedPosition: LiquidityPosition;
  onSelectPosition: (position: LiquidityPosition) => void;
  positions: LiquidityPosition[];
}

export default function LiquidityPositionSelector({
  selectedPosition,
  onSelectPosition,
  positions,
}: LiquidityPositionSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="pl-1 pr-2 sm:pl-2 sm:pr-3 py-4 sm:py-6 h-auto flex items-center gap-1"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative h-6 w-10 sm:h-8 sm:w-12">
              <div className="absolute left-0 top-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={selectedPosition.token1.icon || "/placeholder.svg"}
                  alt={selectedPosition.token1.symbol}
                  width={32}
                  height={32}
                />
              </div>
              <div className="absolute left-4 sm:left-4 top-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-background">
                <Image
                  src={selectedPosition.token2.icon || "/placeholder.svg"}
                  alt={selectedPosition.token2.symbol}
                  width={32}
                  height={32}
                />
              </div>
            </div>
            <span className="font-medium text-sm sm:text-base">
              {selectedPosition.symbol}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-80 p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search position..." />
          <CommandList>
            <CommandEmpty>No position found.</CommandEmpty>
            <CommandGroup>
              {positions.map((position) => (
                <CommandItem
                  key={position.id}
                  onSelect={() => {
                    onSelectPosition(position);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 py-3 px-2"
                >
                  <div className="relative h-8 w-12">
                    <div className="absolute left-0 top-0 h-6 w-6 rounded-full overflow-hidden bg-background">
                      <Image
                        src={position.token1.icon || "/placeholder.svg"}
                        alt={position.token1.symbol}
                        width={24}
                        height={24}
                      />
                    </div>
                    <div className="absolute left-4 top-0 h-6 w-6 rounded-full overflow-hidden bg-background border-2 border-background">
                      <Image
                        src={position.token2.icon || "/placeholder.svg"}
                        alt={position.token2.symbol}
                        width={24}
                        height={24}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{position.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      Pool share: {position.share}
                    </span>
                  </div>
                  <div className="ml-auto text-xs text-right">
                    <div>{position.balance} LP</div>
                    <div className="text-muted-foreground">
                      ${position.totalValue.toLocaleString()}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
