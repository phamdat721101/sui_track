"use client";

import { cn } from "../../../lib/utils";
import {
  Menu,
  FlameIcon,
  UsersIcon,
  ChartColumnIncreasingIcon,
  DatabaseIcon,
  FileChartColumnIncreasingIcon,
  NewspaperIcon,
  SendIcon,
  ViewIcon,
  ChartSplineIcon,
  FishSymbolIcon,
  ChartCandlestickIcon,
  MessageSquareMoreIcon,
  TrophyIcon,
  CpuIcon,
  MessageCircle,
  Gamepad2Icon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../../ui/Sheet";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenu, SidebarGroup, SidebarSeparator } from "../../ui/sidebar";
import { VisuallyHidden, Root } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import Link from "next/link";
import GlobalContext from "../../../context/store";
import { useState } from "react";
import { useContext } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "../../ui/Button";
import SubscriptionDialog from "../Subscription";

interface ChainButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  isNew?: boolean;
  logo: string;
  name: string;
}

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Drawer using Sheet component */}
      <div className="md:hidden z-50">
        <Sheet>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 p-2 bg-[#112548] rounded-lg hover:bg-primary/90 border">
              <Menu className="h-6 w-6 text-primary-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] p-0 bg-primary text-gray-50"
          >
            <VisuallyHidden>
              <SheetTitle>Main</SheetTitle>
            </VisuallyHidden>
            <div className="h-full flex flex-col">
              <MobileSidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div
          className={`
          relative 
          ${isCollapsed ? "w-[93px]" : "w-[210px]"}
          transition-all duration-300
          h-screen
        `}
        >
          <div className="flex flex-col h-full sidebar">
            <DesktopSidebarContent isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>
    </>
  );
}

function MobileSidebarContent() {
  const { selectedChain, setSelectedChain, selectedNav, setSelectedNav } =
    useContext(GlobalContext);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  return (
    <>
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="trackit" height={40} width={40} />
          <span className="font-bold text-2xl">TrackIt</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <SidebarGroup>
          <SidebarMenu>
            {mainNav.map((nav) => (
              <SidebarMenuItem
                key={nav.name}
                className={`${selectedNav === nav.name ? "selected-nav" : ""}`}
              >
                <SidebarMenuButton
                  asChild
                  onClick={() => {
                    setSelectedNav(nav.name);
                  }}
                >
                  <Link
                    href={nav.url}
                    className={
                      selectedNav === nav.name
                        ? "text-bluesky"
                        : "text-gray-500"
                    }
                  >
                    {nav.icon}
                    <span
                      className={
                        selectedNav === nav.name
                          ? "text-gray-400"
                          : "text-gray-500"
                      }
                    >
                      {nav.name}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="my-4 bg-itemborder" />
        <SidebarGroup className="grid grid-cols-3 gap-2 p-0">
          {chains.map((chain) => (
            <ChainButton
              key={chain.name}
              logo={chain.logo}
              name={chain.name}
              isActive={selectedChain === chain.value}
              onClick={() => setSelectedChain(chain.value)}
            />
          ))}
        </SidebarGroup>        
      </div>

      <div className="pt-4 mx-auto">
        <Button
          variant="outline"
          className="px-10 bg-transparent border-bluesky text-bluesky hover:bg-blue-500 hover:text-white"
          onClick={() => setIsSubscriptionOpen(true)}
        >
          Subscribe
        </Button>
        {/* Subscription Modal */}
        <SubscriptionDialog
          open={isSubscriptionOpen}
          onOpenChange={() => setIsSubscriptionOpen(false)}
        />
      </div>      
    </>
  );
}

function DesktopSidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
  const { selectedNav, setSelectedNav } = useContext(GlobalContext);
  const { connected, disconnect } = useWallet();
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  return (
    <>
      <div className="py-4 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="trackit" height={40} width={40} />
          {!isCollapsed && <span className="font-bold text-2xl">TrackIt</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-0 pl-6">
        <SidebarGroup>
          <SidebarMenu className="gap-4">
            {mainNav.map((nav) => (
              <SidebarMenuItem
                key={nav.name}
                className={`${selectedNav === nav.name ? "selected-nav" : ""}`}
              >
                <SidebarMenuButton
                  asChild
                  onClick={() => {
                    setSelectedNav(nav.name);
                  }}
                >
                  <Link
                    href={nav.url}
                    className={
                      selectedNav === nav.name
                        ? "text-bluesky"
                        : "text-gray-500"
                    }
                  >
                    {nav.icon}
                    <span
                      className={
                        selectedNav === nav.name
                          ? "text-gray-400"
                          : "text-gray-500"
                      }
                    >
                      {nav.name}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup> 
      </div>

      <div className="pt-4 mx-auto">
        <Button
          variant="outline"
          className="px-10 bg-transparent border-bluesky text-bluesky hover:bg-blue-500 hover:text-white"
          onClick={() => setIsSubscriptionOpen(true)}
        >
          Subscribe
        </Button>
        {/* Subscription Modal */}
        <SubscriptionDialog
          open={isSubscriptionOpen}
          onOpenChange={() => setIsSubscriptionOpen(false)}
        />
      </div>

      {/* <div className="p-4 pl-6 space-y-6">
        <SidebarGroup>
          <SidebarMenu>
            {connected && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-gray-400">
                    <SlidersVerticalIcon />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-gray-400"
                    onClick={disconnect}
                  >
                    <LogOutIcon />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
            {!connected && (
              <SidebarMenuItem>
                <SidebarMenuButton className="text-gray-400" onClick={() => {}}>
                  <LogInIcon />
                  <span>Login</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </div> */}
    </>
  );
}

function ChainButton({
  isActive,
  isNew,
  logo,
  name,
  className,
  ...props
}: ChainButtonProps) {
  return (
    <button
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-xl p-4 text-center",
        isActive && "bg-gray-600",
        className
      )}
      {...props}
    >
      {isNew && (
        <span className="absolute right-2 top-2 rounded bg-emerald-500 px-1.5 py-0.5 text-xs font-medium text-white">
          NEW
        </span>
      )}
      <Image
        src={logo}
        alt={name}
        width={20}
        height={20}
        className="mb-2 text-2xl"
      />
      <span className="text-xs font-medium text-gray-50">{name}</span>
    </button>
  );
}

const chains = [
  {
    name: "Sui",
    logo: "/chains/sui.svg",
    value: "sui",
  }  
];

const mainNav = [
  {
    icon: <FlameIcon />,
    name: "List Token",
    url: "/",
  },
  {
    icon: <UsersIcon />,
    name: "Portfolio",
    url: "/portfolio",
    content: "Add and track a newly created token pair on the platform.",
  },
  {
    icon: <ChartColumnIncreasingIcon />,
    name: "Trending",
    url: "/trending",
    content: "View top-trending tokens based on volume and social mentions.",
  },
  {
    icon: <DatabaseIcon />,
    name: "Holding",
    url: "/holding",
    content: "Monitor your current holdings and portfolio performance.",
  },
  {
    icon: <FileChartColumnIncreasingIcon />,
    name: "Follow",
    url: "/follow",
    content: "Follow specific tokens or wallets for real-time updates.",
  },
  {
    icon: <CpuIcon />,
    name: "Tracker",
    url: "/tracker",
    content: "Professional analysis tools for tokens.",
  },
  {
    icon: <MessageCircle />,
    name: "Chat",
    url: "/chat",
    content: "Chat bot.",
  },
  {
    icon: <Gamepad2Icon />,
    name: "Games",
    url: "/games",
    content: "TrackIt games",
  },
];

const secondNav = [
  {
    icon: <ChartSplineIcon />,
    name: "Token Analytics",
    url: "#",
    content:
      "Access detailed analytics for any token, including price charts and on-chain data.",
  },
  {
    icon: <ViewIcon />,
    name: "Wallet Analyzer",
    url: "#",
    content:
      "Analyze wallet addresses, track transactions, and review portfolio allocations.",
  },
  {
    icon: <FishSymbolIcon />,
    name: "Whales Tracker",
    url: "#",
    content: "Identify and monitor large wallet (whale) activities and trades.",
  },
  {
    icon: <SendIcon />,
    name: "Telegram Bot",
    url: "#",
    content:
      "Configure the Telegram bot for real-time token price alerts and notifications.",
  },

  {
    icon: <NewspaperIcon />,
    name: "News Aggregator",
    url: "#",
    content: "Stay updated with curated crypto news and market insights.",
  },
];

const thirdNav = [
  {
    icon: <TrophyIcon />,
    name: "Top Traders",
    url: "#",
    content:
      "Track the best-performing traders and learn from their strategies.",
  },
  {
    icon: <MessageSquareMoreIcon />,
    name: "InsightsGPT",
    url: "#",
    content:
      "Leverage AI-driven insights for market trends and token research.",
  },

  {
    icon: <ChartCandlestickIcon />,
    name: "Smart Traders",
    url: "#",
    content: "Gain access to exclusive tools used by professional traders.",
  },
];
