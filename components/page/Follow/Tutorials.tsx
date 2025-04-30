"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/Button";
import { Check, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Tutorials() {
  const [showDialog, setShowDialog] = useState(true);

  // Reset dialog state when navigating to this page
  useEffect(() => {
    setShowDialog(true);
  }, []);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <VisuallyHidden>
        <DialogTitle>Tutorials</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="max-w-xl p-0 border-none bg-[#121212] text-white max-h-[90vh] overflow-y-auto">
        <DialogDescription></DialogDescription>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4">
            <div className="flex justify-center">
              <div className="bg-[#121212] p-2 rounded-full"></div>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            TrackIt: Decentralized Multi-Chain Analytics Tool
          </h1>

          <div className="mt-8 mb-8">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
              Follow
            </h2>

            <div className="flex flex-col gap-3 items-center">
              <div className="flex items-center gap-2">
                <Check className="text-yellow-400" />
                <span>
                  Follow specific tokens or wallets for real-time updates.
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
