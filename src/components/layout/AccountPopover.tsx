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

export default function AccountPopover() {
  const { isCollapsed } = useAppSelector((state) => state.layout);

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
            <span className="text-xs text-gray-500">@ahmed_awad</span>
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
              className="mr-2 text-gray-600"
            />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Iconify
              icon="solar:bill-list-bold-duotone"
              fontSize={22}
              className="mr-2 text-gray-600"
            />
            Billing
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Iconify
              icon="solar:settings-bold-duotone"
              fontSize={22}
              className="mr-2 text-gray-600"
            />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Iconify
            icon="solar:logout-3-bold-duotone"
            fontSize={22}
            className="mr-2 text-gray-600"
          />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
