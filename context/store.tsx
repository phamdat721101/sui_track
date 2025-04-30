"use client";
import { TokenInfo, TokenInfoSui, TokenMoveFunInfo } from "../types/interface";
import { createContext, Dispatch, SetStateAction, useState } from "react";

interface ContextProps {
  isLogged: boolean;
  setIsLogged: Dispatch<SetStateAction<boolean>>;
  loadingFullScreen: boolean;
  setLoadingFullScreen: Dispatch<SetStateAction<boolean>>;
  selectedToken: TokenInfo | TokenInfoSui | TokenMoveFunInfo | null;
  setSelectedToken: Dispatch<
    SetStateAction<TokenInfo | TokenInfoSui | TokenMoveFunInfo | null>
  >;
  selectedChain: string;
  setSelectedChain: Dispatch<SetStateAction<string>>;
  selectedNav: string;
  setSelectedNav: Dispatch<SetStateAction<string>>;
}

const GlobalContext = createContext<ContextProps>({
  isLogged: false,
  setIsLogged: () => {},
  loadingFullScreen: false,
  setLoadingFullScreen: () => {},
  selectedToken: null,
  setSelectedToken: () => {},
  selectedChain: "sui",
  setSelectedChain: () => {},
  selectedNav: "",
  setSelectedNav: () => {},
});

export default GlobalContext;

export const GlobalContextProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isLogged, setIsLogged] = useState(false);
  const [loadingFullScreen, setLoadingFullScreen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<
    TokenInfo | TokenInfoSui | TokenMoveFunInfo | null
  >(token);
  const [selectedChain, setSelectedChain] = useState<string>("sui");
  const [selectedNav, setSelectedNav] = useState<string>("");

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        loadingFullScreen,
        setLoadingFullScreen,
        selectedToken,
        setSelectedToken,
        selectedChain,
        setSelectedChain,
        selectedNav,
        setSelectedNav,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

const token = {
  id: "e8153a20-f0ca-11ef-bdff-3b9df9be0b0a",
  name: "WARPGATE",
  tickerSymbol: "WARPGATE",
  desc: "WARPGATE",
  creator: "0xc60bab2ac8295e7a2c12c3196848e5a423d2bf13fec044c201704e4818756667",
  mintAddr:
    "0x8769ef52965be6bb82bd483492f94ed71456a62b63980013b25e5ac5ffcb6726::wiz::WIZ",
  image: "https://hatchy.s3.us-east-2.amazonaws.com/1740193973728-gifs_1_.gif",
  twitter: null,
  telegram: null,
  website: null,
  status: "ACTIVE",
  cdate: "2025-02-22T03:12:53.000Z",
  creatorName: "anteriorrecipient",
  creatorWalletAddr:
    "0xc60bab2ac8295e7a2c12c3196848e5a423d2bf13fec044c201704e4818756667",
  creatorAvatar: null,
  replies: 0,
  marketCapUSD: 41832.5875056111,
  trades: [
    {
      side: "BUY",
      count: "16",
      volume: "15952.000000000000000000",
    },
  ],
  aptosUSDPrice: 0.483807,
  holderPercentage: "1",
  bondinCurvepercentage: 105.2832,
  seeded: "COMPLETED",
  exchange: "warpgate",
  pool_url:
    "https://warpgate.fun/trading-view/0xc60bab2ac8295e7a2c12c3196848e5a423d2bf13fec044c201704e4818756667::WARPGATE::WARPGATE",
};
