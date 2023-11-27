import { useAppSelector } from "@/redux/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Iconify from "../ui/icon";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useCallback } from "react";

export default function AccountPopover() {
  const { isCollapsed } = useAppSelector((state) => state.layout);

  const { theme, setTheme } = useTheme();

  const handleToggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex w-full cursor-pointer items-center gap-2 rounded border p-2 hover:bg-accent">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "flex origin-left flex-col transition-all duration-500",
              isCollapsed ? "scale-0" : "scale-100",
            )}
          >
            <span className="text-sm font-semibold">Ahmed Awad</span>
            <span className="text-xs text-accent-foreground/60">
              @ahmed_awad
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Iconify
              icon="solar:user-circle-bold-duotone"
              fontSize={22}
              className="mr-2 text-foreground/80"
            />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Iconify
              icon="solar:bill-list-bold-duotone"
              fontSize={22}
              className="mr-2 text-foreground/80"
            />
            Billing
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Iconify
              icon="solar:settings-bold-duotone"
              fontSize={22}
              className="mr-2 text-foreground/80"
            />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleTheme}>
          <Iconify
            icon={
              theme === "dark"
                ? "solar:moon-stars-bold-duotone"
                : "solar:sun-2-bold-duotone"
            }
            fontSize={22}
            className="mr-2 text-foreground/80"
          />
          Toggle {theme === "dark" ? "Light" : "Dark"} Mode
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Iconify
            icon="solar:logout-3-bold-duotone"
            fontSize={22}
            className="mr-2 text-foreground/80"
          />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
