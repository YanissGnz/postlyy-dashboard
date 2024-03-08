import { LAYOUT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  closeMobileSidebar,
  openMobileSidebar,
} from "@/redux/slices/layoutSlice";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback } from "react";
import { Button } from "../../../components/ui/button";
import Iconify from "../../../components/ui/icon";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../../components/ui/sheet";
import MobileAccountPopover from "./mobile-account-popover";
import NavItem from "./nav-item";

export default function Header() {
  const { navItems, isMobileSidebarOpen } = useAppSelector(
    (state) => state.layout,
  );
  const session = useSession();

  const dispatch = useAppDispatch();

  const handleOpenSidebar = useCallback(() => {
    dispatch(openMobileSidebar());
  }, []);

  const handleToggleSidebar = useCallback((open: boolean) => {
    if (open) dispatch(openMobileSidebar());
    else dispatch(closeMobileSidebar());
  }, []);

  if (!session.data) {
    return null;
  }

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
                  <div className="w-full space-y-2">
                    <h6>{item.name}</h6>
                    <div className="w-full">
                      {item.children.map((nav) => (
                        <div className={cn("ml-2 w-full")}>
                          {nav.needAccount
                            ? nav.roles.includes(
                                session?.data?.user.userType,
                              ) &&
                              session.data?.user?.accounts?.length > 0 && (
                                <NavItem key={nav.path} {...nav} />
                              )
                            : nav.roles.includes(
                                session.data.user.userType,
                              ) && <NavItem key={nav.path} {...nav} />}
                        </div>
                      ))}
                    </div>
                  </div>
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
