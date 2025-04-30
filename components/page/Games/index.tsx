import { GamepadIcon, ScrollTextIcon } from "lucide-react";
import GameCard from "./GameCard";
import { url } from "inspector";
import Leaderboard from "./Leaderboard";

export default function PopularGames() {
  const games = [
    {
      id: 1,
      title: "Tetris",
      description:
        "Score as many points as possible by clearing horizontal rows of blocks",
      image: "/tetris_img.jpg",
      players: 2,
      bgColor: "bg-[#3D1A1A]",
      textColor: "text-white",
      url: "tetris",
    },
  ];

  return (
    <div className="text-gray-300 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <GamepadIcon />
          <h2 className="text-lg font-bold tracking-wide">TrackIt Games</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr relative">
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              image={game.image}
              players={game.players}
              bgColor={game.bgColor}
              textColor={game.textColor}
              url={game.url}
            />
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ScrollTextIcon />
          <h2 className="text-lg font-bold tracking-wide">Leaderboard</h2>
        </div>

        <Leaderboard />
      </div>
    </div>
  );
}
