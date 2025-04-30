import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import Image from "next/image";
import GlobalContext from "../../context/store";
import { useContext } from "react";

const chains = [
  {
    name: "Sui",
    logo: "/chains/sui.svg",
    value: "sui",
  }
];

export default function SelectChain() {
  const { selectedChain, setSelectedChain } = useContext(GlobalContext);
  return (
    <Select onValueChange={setSelectedChain}>
      <SelectTrigger className="w-[140px] bg-[#102447]">
        <SelectValue
          placeholder={
            <div className="flex gap-1 items-center">
              <Image
                src={chains[0].logo}
                alt={chains[0].name}
                width={20}
                height={20}
                className="mr-0.5"
              />
              <span className="text-gray-400">{chains[0].name}</span>
            </div>
          }
        />
      </SelectTrigger>
      <SelectContent className="bg-[#102447]">
        {chains.map((chain) => (
          <SelectItem key={chain.value} value={chain.value}>
            <div className="flex gap-1 items-center">
              <Image
                src={chain.logo}
                alt={chain.name}
                width={20}
                height={20}
                className="mr-0.5"
              />
              <span className="text-gray-400">{chain.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
