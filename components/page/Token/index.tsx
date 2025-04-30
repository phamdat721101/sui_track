"use client";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import Chart from "./CustomChart";
import TxHistory from "./TxHistory";
import Detail from "./Detail";

const main_tabs = ["Activity", "Traders", "Holders", "BC Owners"];

const sub_tabs = [
  "All",
  "Smart",
  "KOL/VC",
  "Whale",
  "Fresh",
  "Snipers",
  // "Top",
  // "DEV",
  // "Insiders",
];

export default function Token() {
  return (
    <div className="grid md:grid-cols-[3.5fr_1.2fr] flex-1 gap-4">
      {/* Middle */}
      <div className="space-y-4 min-w-0 transition-all duration-100 ease-in-out">
        {/* Chart Area */}
        <div className="bg rounded-lg">
          <Chart />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="Activity" className="w-full">
          {/* <TabsList className="p-0 text-center bg-transparent space-x-5">
            {main_tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={tab}
                className="md:px-5 grid bg-[#102447] data-[state=active]:bg-[#005880] data-[state=active]:text-gray-300 h-full rounded-lg data-[state=active]:rounded-lg"
              >
                <span>{tab}</span>
              </TabsTrigger>
            ))}
          </TabsList> */}
        </Tabs>
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="p-0 text-center bg-transparent rounded-xl gap-1">
            {sub_tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={tab}
                disabled={tab !== "All"}
                className="min-w-14 py-0 grid bg-[#102447] data-[state=active]:bg-[#005880] data-[state=active]:text-gray-50 h-9 rounded-lg data-[state=active]:rounded-none data-[state=active]:rounded-lg border border-[#1a3c78]"
              >
                <span className="text-xs">{tab}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <TxHistory />
      </div>

      {/* Right Sidebar */}
      <Detail />
    </div>
  );
}
