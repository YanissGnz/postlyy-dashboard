"use client";

import Image from "next/image";
import NavItem from "./NavItem";
import { useAppSelector } from "@/app/redux/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function Sidebar() {
  const { navItems } = useAppSelector((state) => state.layout);

  return (
    <div className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-white p-2">
      <div className="mb-4 inline-flex  items-center gap-2">
        <Image
          src="/icons/logo-transparent.png"
          alt="logo"
          width="64"
          height="64"
          //   className="h-16 w-16"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavItem {...item} />
        ))}
      </div>
      <div className="flex w-full cursor-pointer items-center gap-2 rounded border p-2 hover:bg-gray-200/60">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Ahmed Awad</span>
          <span className="text-xs text-gray-500">@ahmed_awad</span>
        </div>
      </div>
    </div>
  );
}
