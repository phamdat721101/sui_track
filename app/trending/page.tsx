"use client";

import Tutorials from "../../components/page/Trending/Tutorials";
import GlobalContext from "../../context/store";
import { useContext, useEffect } from "react";

export default function Page() {
  const { setSelectedNav } = useContext(GlobalContext);

  useEffect(() => {
    setSelectedNav("Trending");
  }, []);
  return <Tutorials />;
}
