import { type Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Connect your account | Postlyy",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return <>{children};</>;
}
