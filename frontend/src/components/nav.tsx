"use client";

import { useEffect, useState } from "react";
import { LoggedNav } from "@/components/logged_nav";
import { Nav } from "./unlogged_nav";

export default function Navigation() {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("jwt_token");
      setIsSignedIn(!!token);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <>{isSignedIn ? <LoggedNav setIsSignedIn={setIsSignedIn} /> : <Nav />}</>
  );
}
