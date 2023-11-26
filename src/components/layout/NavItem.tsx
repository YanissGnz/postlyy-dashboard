import React from "react";
// next
import { usePathname } from "next/navigation";
import Link from "next/link";
// components
import Iconify from "../ui/icon";
// utils
import { type TNavItem } from "@/app/redux/slices/layoutSlice";
import { cn } from "@/lib/utils";

export default function NavItem({ icon, name, path }: TNavItem) {
  const pathname = usePathname();

  const isActive = pathname?.includes(path);

  return (
    <Link
      href={path}
      className={cn(
        "flex w-full cursor-pointer flex-row items-center gap-2 rounded p-2 ",
        isActive
          ? "bg-gray-200/60 text-primary hover:bg-gray-200"
          : "text-gray-600 hover:bg-gray-200/60",
      )}
    >
      <Iconify icon={icon} height={20} />
      <span className={cn(isActive && "font-semibold")}>{name}</span>
    </Link>
  );
}
