import { TokenCard } from "./TokenCard";

const tokens = [
  {
    icon: "/logo.png",
    name: "Donald",
    title: "Donald J. Trump",
    description: "President Trump's Celebratory Victory Rally",
    percentage: 92.4,
    price: "$68K",
    transactions: 7396,
    volume: "$67K",
    time: "19h",
  },
  {
    icon: "/logo.png",
    name: "Trump",
    title: "Official TrumpRugs Token",
    description:
      "TrumpRugs Token: A Statement for the Rugged Times The TrumpRugs Token is more than just a cryptocurrency; it's a bold statement against all the 'rugs' that have left their mark in the crypto world. Created as a tongue-in-cheek nod to the...",
    percentage: 12.4,
    price: "$7.9K",
    transactions: 489,
    volume: "$62K",
    time: "17h",
  },
  {
    icon: "/logo.png",
    name: "eDOGE",
    title: "Based eDOGE Official",
    description:
      "Launched 1/20/2025 at 12PM EST - Inauguration The concept of eDOGE emerged in a discussion between Elon Musk and Donald Trump, where Musk floated the idea of a department for streamlining government efficiency. In August 2024, Trump...",
    percentage: 21.1,
    price: "$6.9K",
    transactions: 95,
    volume: "$29K",
    time: "14h",
  },
];

export default function TokenCards() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-4">
        {tokens.map((token, i) => (
          <TokenCard key={i} {...token} />
        ))}
      </div>
    </div>
  );
}
