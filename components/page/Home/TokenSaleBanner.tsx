"use client";

import { useEffect, useState } from "react";
import { ArrowRight, XIcon } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/Card";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function TokenSaleBanner() {
  const [showBanner, setShowBanner] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set the date for May 1, 2025
    const saleDate = new Date("2025-05-01T00:00:00").getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = saleDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        // Sale has started
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Clean up
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`w-full pb-4 border-b border-b-itemborder mb-4 ${
        showBanner ? "" : "hidden"
      }`}
    >
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-bluesky via-blue-700 to-blue-500">
        <CardContent className="relative p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 md:p-6 text-white">
            <div className="col-span-2 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                TrackIt Token: Coming soon!
              </h2>
              <p className="text-white">
                Don&apos;t miss it! Trackit Token is on its way!
              </p>
            </div>

            <div className="flex flex-col justify-center gap-2">
              <div className="grid grid-cols-4 gap-2 text-center">
                <CountdownItem value={timeLeft.days} label="Days" />
                <CountdownItem value={timeLeft.hours} label="Hours" />
                <CountdownItem value={timeLeft.minutes} label="Minutes" />
                <CountdownItem value={timeLeft.seconds} label="Seconds" />
              </div>
            </div>     
          </div>
          <Button
            onClick={() => setShowBanner(false)}
            className="absolute top-0 right-0 h-4 w-4 p-3 bg-transparent hover:bg-blue-400 rounded-full"
          >
            <XIcon />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function CountdownItem({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 md:p-2">
        <div className="text-xl md:text-2xl font-bold">
          {value.toString().padStart(2, "0")}
        </div>
        <div className="text-xs text-white">{label}</div>
      </div>
    </div>
  );
}
