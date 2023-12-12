import React, { useCallback } from "react";
import Image from "next/image";
import {
  openMobileSidebar,
  closeMobileSidebar,
} from "@/redux/slices/layoutSlice";
import { LAYOUT } from "@/lib/constants";
import { Button } from "../../../components/ui/button";
import Iconify from "../../../components/ui/icon";
import NavItem from "./nav-item";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../../components/ui/sheet";
import MobileAccountPopover from "./mobile-account-popover";

export default function Header() {
  const { navItems, isMobileSidebarOpen } = useAppSelector(
    (state) => state.layout,
  );

  const dispatch = useAppDispatch();

  const handleOpenSidebar = useCallback(() => {
    dispatch(openMobileSidebar());
  }, []);

  const handleToggleSidebar = useCallback((open: boolean) => {
    if (open) dispatch(openMobileSidebar());
    else dispatch(closeMobileSidebar());
  }, []);

  return (
    <>
      <header
        className="flex w-full items-center justify-between border-b px-4"
        style={{
          height: LAYOUT.HEADER_HEIGHT,
        }}
      >
        <Sheet open={isMobileSidebarOpen} onOpenChange={handleToggleSidebar}>
          <SheetTrigger>
            <Button variant="outline" size="icon" onClick={handleOpenSidebar}>
              <Iconify icon="solar:hamburger-menu-line-duotone" fontSize={20} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            style={{
              width: LAYOUT.MOBILE_SIDEBAR_WIDTH,
            }}
            className="p-3"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Image
                  src="/icons/logo-transparent.png"
                  alt="logo"
                  width="64"
                  height="64"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {navItems.map((item) => (
                  <NavItem {...item} />
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <MobileAccountPopover />
      </header>
    </>
  );
}
