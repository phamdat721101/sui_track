"use client";

import Tutorials from "../../components/page/NewPair/Tutorials";
import GlobalContext from "../../context/store";
import { useContext, useEffect } from "react";

export default function Page() {
  const { setSelectedNav } = useContext(GlobalContext);

  useEffect(() => {
    setSelectedNav("New Pair");
  }, []);
  return <Tutorials />;
}
