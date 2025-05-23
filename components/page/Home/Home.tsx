"use client";

import { useContext, useState } from "react";
import { Button } from "../../ui/Button";
import CryptoTable from "./CryptoTable";
import { FilterIcon, FilterXIcon } from "lucide-react";
import Pools from "./Pools";
import GlobalContext from "../../../context/store";
import { ChartPieIcon } from "lucide-react";
import AnalyzeDialog from "./AnalyzeDialog";

export default function Home() {
  const { selectedChain } = useContext(GlobalContext);
  const [selectedTab, setSelectedTab] = useState("Pool");
  const [selectedDex, setSelectedDex] = useState("Move.Fun");
  const [showAnalyze, setShowAnalyze] = useState<boolean>(false);

  const handleTabChange = (value: string) => {
    setSelectedDex(value);
  };

  const renderComponent = () => {
    switch (selectedTab) {
      case "Token":
        return <CryptoTable dex={selectedDex} />;
      case "Pool":
        return <Pools />;
      default:
        return <CryptoTable />;
    }
  };

  return (
    <div className="w-full h-[calc(100vh-6rem)] text-gray-100 overflow-hidden flex flex-col shadow-lg">
      <div className="mb-4 md:flex">
        <div className="border border-[#1a3c78] rounded-lg w-fit mb-3 md:mb-0">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setSelectedTab(tab)}
              className={`${
                selectedTab === tab
                  ? "bg-[#005880] text-gray-300 font-semibold"
                  : "bg-[#102447] text-gray-500"
              } text-sm border-r border-r-[#1a3c78] last:border-none rounded-none first:rounded-s-lg last:rounded-e-lg hover:bg-[#005880] hover:text-current`}
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">          
          <Button
            className="px-5 text-gray-300 bg-[#102447] hover:bg-[#005880] hover:text-current border border-[#1a3c78]"
            onClick={() => setShowAnalyze(true)}
          >
            <ChartPieIcon className="mr-2" />
            <span className="text-[15px]">Analyze</span>
          </Button>
        </div>
      </div>
      {renderComponent()}
      <AnalyzeDialog
        open={showAnalyze}
        onOpenChange={setShowAnalyze}
        dex={selectedDex}
        tab={selectedTab}
      />
    </div>
  );
}

const tabs = ["Token", "Pool"];