import { Button } from "../../ui/Button";
import Image from "next/image";

const dexes = [
  { name: "WarpGate", logo: "/warpgate.png" },
  { name: "RouteX", logo: "/routex.png" },
];

export default function DexList() {
  return (
    <>
      <div className="hidden md:block w-40 border-r border-r-itemborder p-3 text-gray-50 text-sm">
        <div className="mb-4">
          <h1 className="ml-5 font-bold">All DEXes</h1>
        </div>
        <nav className="space-y-2">
          {dexes.map((dex) => (
            <Button
              key={dex.name}
              variant="ghost"
              className="w-full justify-start"
            >
              <Image src={dex.logo} alt={dex.name} width={24} height={24} />
              {dex.name}
            </Button>
          ))}
        </nav>
      </div>
      <div className="md:hidden px-4 py-1 flex items-center gap-4 text-gray-50 text-sm">
        <h1 className="font-bold">All DEXes</h1>
        <nav className="flex items-center gap-4">
          {dexes.map((dex) => (
            <Button
              key={dex.name}
              variant="ghost"
              className="w-full justify-start"
            >
              <Image src={dex.logo} alt={dex.name} width={24} height={24} />
              {dex.name}
            </Button>
          ))}
        </nav>
      </div>
    </>
  );
}
