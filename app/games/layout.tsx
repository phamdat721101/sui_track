"use client";

import GlobalContext from "../../context/store";
import { useContext, useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setSelectedNav } = useContext(GlobalContext);

  useEffect(() => {
    setSelectedNav("Games");
  }, []);

  return <>{children}</>;
}
