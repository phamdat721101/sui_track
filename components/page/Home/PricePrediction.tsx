"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Card, CardContent } from "../../ui/Card";
import { Separator } from "../../ui/separator";
import { PricePredictionData } from "../../../types/interface";
import { SparklesIcon } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

interface PricePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PricePredictionData;
}

export default function PricePredictionModal({
  isOpen,
  onClose,
  data,
}: PricePredictionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black/95 text-gray-200 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-yellow-500">
            <SparklesIcon />
            <span>AI Price Predictions for {data.coinMetadata.symbol}</span>
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
              Experimental
            </span>
          </DialogTitle>
          <p className="text-sm text-blue-500">
            Predictions generated on:{" "}
            {formatDistanceToNowStrict(data.lastUpdated, { addSuffix: true })}
          </p>
        </DialogHeader>

        <div className="py-2">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Analyzed Past Data */}
            <Card className="bg-transparent border-gray-800">
              <CardContent className="p-4">
                <h3 className="text-lg mb-4 text-gray-50 font-semibold">
                  Analyzed Past Data
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trades Analyzed</span>
                    <span className="text-gray-50 font-semibold">
                      {data.sellTrades + data.buyTrades}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unique Traders</span>
                    <span className="text-gray-50 font-semibold">
                      {data.totalUniqueUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Price</span>
                    <span className="text-gray-50 font-semibold">
                      ${data.currentPriceLow.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Maximum Price</span>
                    <span className="text-gray-50 font-semibold">
                      ${data.currentPriceHigh.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Volume-Weighted Average Price (VWAP)
                    </span>
                    <span className="text-gray-50 font-semibold">
                      ${data.currentVolumeWeightedAveragePrice.toFixed(7)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Short-Term Moving Average Price
                    </span>
                    <span className="text-gray-50 font-semibold">
                      ${data.currentShortTermMovingAveragePrice.toFixed(7)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Long-Term Moving Average Price
                    </span>
                    <span className="text-gray-50 font-semibold">
                      ${data.currentLongTermMovingAveragePrice.toFixed(7)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predicted Data */}
            <Card className="bg-transparent border-gray-800">
              <CardContent className="p-4">
                <h3 className="text-lg mb-4 text-gray-50 font-semibold">
                  Predicted Data (next 24 hrs)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Likely Average Price</span>
                    <span className="text-gray-50 font-semibold">
                      ${data.likelyAveragePriceInNext24Hours.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Expected High</span>
                    <div className="text-right">
                      <div className="text-gray-50 font-semibold">
                        ${data.expectedPriceHighInNext24Hours.toFixed(4)}
                      </div>
                      <div className="text-sm text-green-500">
                        {/* +{data.predictedData.expectedHigh.change.toFixed(3)}% */}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Expected Low</span>
                    <div className="text-right">
                      <div className="text-gray-50 font-semibold">
                        ${data.expectedPriceLowInNext24Hours.toFixed(3)}
                      </div>
                      <div className="text-sm text-red-500">
                        {/* {data.predictedData.expectedLow.change.toFixed(3)}% */}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 bg-gray-800" />

                <div>
                  <h4 className="text-yellow-500 mb-2 font-semibold">
                    Probable Trends in Price Action
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {data.expectedPriceTrends.map((trend, index) => (
                      <li key={index} className="text-gray-300">
                        • {trend}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
