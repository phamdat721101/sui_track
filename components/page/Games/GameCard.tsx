import Image from "next/image";
import { Eye } from "lucide-react";
import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  players: number;
  bgColor?: string;
  textColor?: string;
  url: string;
}

export default function GameCard({
  title,
  description,
  image,
  players,
  bgColor = "bg-gray-800",
  textColor = "text-white",
  url,
}: GameCardProps) {
  return (
    <Link href={`/games/${url}`}>
      <div className="rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/30 hover:z-10 cursor-pointer group border border-itemborder">
        <div className="relative overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            width={500}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">{players} Playing</span>
          </div> */}
        </div>
        <div
          className={`${bgColor} p-6 flex-1 flex flex-col transition-colors duration-300 group-hover:brightness-110`}
        >
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className={`${textColor} opacity-80 text-sm flex-1`}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
