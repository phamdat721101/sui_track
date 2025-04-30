import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import {
  MoreVertical,
  Twitter,
  Globe,
  DiscIcon as Discord,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NftPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Image
              src="/placeholder.svg"
              alt="Logo"
              width={40}
              height={40}
              className="rounded"
            />
            <nav className="hidden md:flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-white">
                Questboard
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                My Projects
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-xs flex items-center justify-center">
                2
              </div>
              <Globe className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>EP</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <div className="col-span-1 hidden md:block">
            <div className="flex flex-col gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-10 h-10 rounded-full bg-blue-600" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-10 h-10 rounded-full bg-teal-600" />
              </Button>
            </div>
          </div>

          {/* Main Area */}
          <div className="col-span-12 md:col-span-11">
            {/* Project Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
              <Image
                src="/placeholder.svg"
                alt="Project"
                width={120}
                height={120}
                className="rounded-lg"
              />
              <div className="flex-1">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Project Name</h1>
                    <div className="flex gap-3">
                      <Twitter className="h-5 w-5 text-gray-400" />
                      <Discord className="h-5 w-5 text-gray-400" />
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline">QUEST BOARD</Button>
                    <Button>JOIN TOWNHALL</Button>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  Suspendisse sem eros, scelerisque sed ultricies at, egestas
                  quis dolor est dosit merta
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 bg-gray-800 rounded-lg">
                    <div className="text-xl font-bold">32</div>
                    <div className="text-sm text-gray-400">Quests</div>
                  </div>
                  <div className="px-4 py-2 bg-gray-800 rounded-lg">
                    <div className="text-xl font-bold">7.2K</div>
                    <div className="text-sm text-gray-400">Follower</div>
                  </div>
                  <div className="px-4 py-2 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Project created</div>
                    <div className="font-bold">30 Mar, 23</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Project Leaderboard</h2>
                  <Tabs defaultValue="weekly">
                    <TabsList className="bg-gray-800">
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="alltime">All Time</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="text-lg font-bold">{i}.</div>
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">Username</div>
                        <div className="text-sm text-gray-400">56 Quests</div>
                      </div>
                      <div className="text-blue-500">75 XP</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">View Category</h2>
              <div className="flex flex-wrap gap-2">
                {["NFT", "GameFi", "DeFi", "DAO", "SocialFi"].map(
                  (category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="px-4 py-2 text-sm"
                    >
                      {category}
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* Quest Cards */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Ready to Claim (Quests that are approved)
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                          src="/placeholder.svg"
                          alt={`Quest ${i}`}
                          width={300}
                          height={300}
                          className="w-full aspect-square object-cover rounded-t-lg"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-2">Quest Card {i}</h3>
                        <p className="text-sm text-gray-400">
                          Suspendisse sem eros, scelerisque sed ultricies at
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
