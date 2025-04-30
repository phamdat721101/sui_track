import type { Metadata } from "next";
import { Red_Hat_Text } from "next/font/google";
import "./globals.css";
import { GlobalContextProvider } from "@/context/store";
import WalletProvider from "../provider/WalletProvider";
import Layout from "../components/layout/NewLayout";

const redHatText = Red_Hat_Text({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrackIt",
  description: "TrackIt app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${redHatText.className} antialiased`}
      >
        <WalletProvider>
          <GlobalContextProvider>
            <Layout>{children}</Layout>
          </GlobalContextProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
