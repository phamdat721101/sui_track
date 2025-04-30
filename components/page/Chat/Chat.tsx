"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonalIcon, User, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/Avatar";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/Card";
import MarkdownDisplay from "./MarkdownDisplay";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

import { SuiAgentKit, createSuiTools } from "@getnimbus/sui-agent-kit";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
const mnemonic = "program level hungry inflict slim venue coil cereal either input nominee calm";
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);

// Initialize with private key and optional RPC URL
const agent = new SuiAgentKit(
  keypair.getSecretKey(),
  "https://explorer-rpc.testnet.sui.io",
  {
    OPENAI_API_KEY: "your-openai-api-key"
  }
);
const tools = createSuiTools(agent);

function getAddressTool() {
  return tools.find(
    (tool) => tool.constructor.name === "SuiGetWalletAddressTool"
  ) as { run: () => Promise<string> } | undefined;
}

export default function ChatPage() {   
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === "") return;
        
    const newMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");

    if(inputMessage.includes("get wallet address")){
      const botMessage: Message = {
        id: Date.now(),
        text: agent.getWalletAddress(),
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      return
    }

    const reply = await fetchBotMessage(inputMessage);

    if (reply) {
      const botMessage: Message = {
        id: Date.now(),
        text: reply,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }
  };

  const fetchBotMessage = async (userInput: string) => {
    const url = `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/agent/chat`;
    console.log("Api url: ", url)
    const value = {
      content: userInput,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      });
      const result: string = await response.json();
      const cleanResult = result.replace(/<think>|<\/think>/g, "");
      return cleanResult;
    } catch (error) {
      console.log("Failed to fetch response.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="w-full h-[85vh] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Send a message to start the conversation
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start mb-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <Avatar className="mr-2 text-gray-800">
                    <AvatarFallback>
                      <Bot size={24} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {message.sender !== "user" && message.text ? (
                    <MarkdownDisplay
                      content={message.text
                        .replace(/(\d+\.\s\*\*[^:]*\*\*:)/g, "## $1")
                        .replace(/\n   - \*\*/g, "\n- **")}
                    />
                  ) : (
                    message.text
                  )}
                </div>
                {message.sender === "user" && (
                  <Avatar className="ml-2 text-gray-800">
                    <AvatarFallback>
                      <User size={24} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-l-lg focus:outline-none text-gray-800"
        />
        <button
          onClick={sendMessage}
          className="h-full bg-bluesky hover:bg-blue-500 text-white p-2 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <SendHorizonalIcon size={20} />
        </button>
      </CardFooter>
    </Card>
  );
}
