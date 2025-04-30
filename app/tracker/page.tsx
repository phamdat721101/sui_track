"use client";

import Tracker from "../../components/page/Tracker/index";
import GlobalContext from "../../context/store";
import { useContext, useEffect } from "react";

export default function TrackerPage() {
  const { setSelectedNav } = useContext(GlobalContext);

  useEffect(() => {
    setSelectedNav("Tracker");
  }, []);

  return <Tracker />;
}
