import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Wallet } from "lucide-react";
import "@mysten/dapp-kit/dist/index.css";

export function CustomBtn() {
  const [open, setOpen] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  if (currentAccount)
    return (
      <Button
        variant="outline"
        className="w-full mt-2 md:mt-0 md:w-40 md:inline-flex bg-[#132d5b] hover:bg-[#1a3c73] text-white border border-[#3b4a60]"
        onClick={() => disconnect()}
      >
        <Wallet className="mr-2 h-4 w-4 text-white" />
        {formatAddress(currentAccount.address)}
      </Button>
    );

  return (
    <ConnectModal
      trigger={
        <Button className="w-full mt-2 md:mt-0 md:w-40 md:inline-flex bg-[#132d5b] hover:bg-[#1a3c73] text-white border border-[#3b4a60]">
          <Wallet className="mr-2 h-4 w-4 text-white" />
          Connect Wallet
        </Button>
      }
      open={open}
      onOpenChange={(isOpen) => setOpen(isOpen)}
    />
  );
}
