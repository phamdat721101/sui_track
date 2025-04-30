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
} from "../../ui//command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/Popover";
import { ChevronDown } from "lucide-react";

type Token = {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  price: number;
  icon: string;
  address: string;
};

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  tokens: Token[];
}

export default function TokenSelector({
  selectedToken,
  onSelectToken,
  tokens,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="pl-1 pr-2 sm:pl-2 sm:pr-3 py-4 sm:py-6 h-auto flex items-center gap-1"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="ml-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={selectedToken?.icon || "/placeholder.svg"}
                alt={selectedToken?.name || "Token"}
                width={24}
                height={24}
              />
            </div>
            <span className="font-medium text-sm sm:text-base">
              {selectedToken?.symbol}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-64 p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search token..." />
          <CommandList>
            <CommandEmpty>No token found.</CommandEmpty>
            <CommandGroup>
              {tokens.map((token) => (
                <CommandItem
                  key={token.id}
                  onSelect={() => {
                    onSelectToken(token);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 py-3 px-2"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={token.icon || "/placeholder.svg"}
                      alt={token.name}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {token.name}
                    </span>
                  </div>
                  <div className="ml-auto text-xs text-right">
                    <div>{token.balance}</div>
                    <div className="text-muted-foreground">
                      $
                      {(Number.parseFloat(token.balance) * token.price).toFixed(
                        2
                      )}
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
