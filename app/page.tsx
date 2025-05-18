"use client";

import Home from "../components/page/Home";
import GlobalContext from "../context/store";
import { useContext, useEffect } from "react";

export default function Page() {
  const { setSelectedNav } = useContext(GlobalContext);

  useEffect(() => {
    setSelectedNav("Explore");
  }, []);

  return (
    <div className="w-full">
      <Home />
    </div>
  );
}
