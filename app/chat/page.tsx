"use client";

import ChatPage from "@/components/page/Chat/Chat";
import GlobalContext from "../../context/store";
import { useContext, useEffect } from "react";

export default function Page() {
  const { setSelectedNav } = useContext(GlobalContext);

  useEffect(() => {
    setSelectedNav("Chat");
  }, []);
  return <ChatPage />;
}
