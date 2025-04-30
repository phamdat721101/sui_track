"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { ArrowRight, Check } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "../../ui/Button";
import { CountdownItem } from "./TokenSaleBanner";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

interface DialogProps {
  value: TimeLeft;
}

export default function BannerDialog({ value: timeLeft }: DialogProps) {
  const [showDialog, setShowDialog] = useState(true);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="bg-white text-gray-900 hover:bg-gray-100">
          Learn More <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <VisuallyHidden>
        <DialogTitle>Banner</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="banner max-w-3xl p-0 border-none bg-[#121212] text-white max-h-[90vh] overflow-y-auto">
        <DialogDescription></DialogDescription>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            TrackIt Token: Coming Soon!
          </h1>

          <div className="mt-8 mb-8">
            <div className="flex flex-col justify-center">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-semibold">Starts In</h3>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <CountdownItem value={timeLeft.days} label="Days" />
                <CountdownItem value={timeLeft.hours} label="Hours" />
                <CountdownItem value={timeLeft.minutes} label="Minutes" />
                <CountdownItem value={timeLeft.seconds} label="Seconds" />
              </div>
              <div className="text-center mt-6 text-purple-200 text-sm">
                Mark your calendar: May 1st, 2025
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
