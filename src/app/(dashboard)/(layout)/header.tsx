import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useLocalStorage } from "usehooks-ts";
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

  const [collapsed, setCollapsed] = useLocalStorage<string[]>("collapsed", [
    "0",
  ]);

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
            className="p-0"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 p-3 pb-0">
                <Image
                  src="/icons/logo-transparent.png"
                  alt="logo"
                  width={50}
                  height={50}
                />
                <h1
                  className={cn(
                    "origin-left text-2xl font-bold text-primary-foreground transition-all duration-500",
                  )}
                >
                  Postlyy
                </h1>
              </div>
              <ScrollArea
                className="mb-2 px-3"
                style={{
                  height: "calc(100vh - 65px)",
                }}
              >
                <Accordion
                  type="multiple"
                  value={collapsed}
                  onValueChange={setCollapsed}
                >
                  {navItems.map((item, groupIndex) => (
                    <div key={item.name} className="w-full space-y-2">
                      <AccordionItem
                        value={groupIndex.toString()}
                        className="border-none"
                      >
                        <AccordionTrigger className="w-full hover:no-underline">
                          <div
                            className={cn(
                              "flex w-full items-center justify-between",
                              "text-muted-foreground",
                            )}
                          >
                            <h6 className="mb-1 font-semibold ">{item.name}</h6>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="w-full space-y-1 pb-1">
                          {item.children.map((nav) => (
                            <div className={cn("w-full pl-2")}>
                              {nav.needAccount
                                ? nav.roles.includes(
                                    session.data.user.userType,
                                  ) &&
                                  session.data.user.accounts.length > 0 && (
                                    <NavItem key={nav.path} {...nav} />
                                  )
                                : nav.roles.includes(
                                    session.data.user.userType,
                                  ) && <NavItem key={nav.path} {...nav} />}
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </div>
                  ))}
                </Accordion>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
        <MobileAccountPopover />
      </header>
    </>
  );
}
