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
        className="w-full mt-2 md:mt-0 md:w-40 md:inline-flex gradient-bg text-white"
        onClick={() => disconnect()}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {formatAddress(currentAccount.address)}
      </Button>
    );

  return (
    <ConnectModal
      trigger={
        <Button className="w-full mt-2 md:mt-0 md:w-40 md:inline-flex gradient-bg">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      }
      open={open}
      onOpenChange={(isOpen) => setOpen(isOpen)}
    />
  );
}
