import { Spinner } from "@/components/ui/Spinner";
import React from "react";

export default function loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center ">
      <Spinner />
    </div>
  );
}
