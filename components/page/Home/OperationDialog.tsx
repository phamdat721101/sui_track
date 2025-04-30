"use client";

import { useState, useEffect } from "react";
import SwapUI from "./SwapUI";
import AddLiquidityUI from "./AddLiquidityUI";
import RemoveLiquidityUI from "./RemoveLiquidityUI";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
}

export default function OperationDialog({
  open,
  onOpenChange,
  initialTab = "swap",
}: SwapDialogProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-auto">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle className="text-center mb-4">
              DEX Operations
            </DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="add">Add Liquidity</TabsTrigger>
            <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="mt-0">
            <SwapUI />
          </TabsContent>

          <TabsContent value="add" className="mt-0">
            <AddLiquidityUI />
          </TabsContent>

          <TabsContent value="remove" className="mt-0">
            <RemoveLiquidityUI />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
