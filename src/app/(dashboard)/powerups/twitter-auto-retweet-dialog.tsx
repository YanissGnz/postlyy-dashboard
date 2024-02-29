"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { closeModal } from "@/redux/slices/modalsSlice";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useSearchUserQuery,
  useUpdateAutoRetweetMutation,
} from "@/redux/api/user/powerups/apiSlice";
import { EProviders } from "@/types/EProviders";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { toast } from "sonner";

export default function TwitterAutoRetweetDialog() {
  const { list } = useAppSelector((state) => state.modals);
  const currentAccount = useAppSelector((state) => state.auth.currentAccount);
  const dispatch = useAppDispatch();

  const [updateAutoRetweet, { isLoading: isUpdatingAutoRetweet }] =
    useUpdateAutoRetweetMutation();

  const [search, setSearch] = useState("");

  const { data: users } = useSearchUserQuery(
    {
      provider: EProviders.Twitter,
      search,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [links, setLinks] = useState(
    (
      list.find((modal) => modal.id === "twitter-auto-retweet")?.data as
        | {
            autoRetweetLinks: {
              userName: string;
              accountId: string;
            }[];
          }
        | undefined
    )?.autoRetweetLinks ?? [],
  );

  const usersList = useMemo(() => {
    if (users) {
      return [
        ...users.map((user) => ({
          username: user.username,
          accId: user.accId,
        })),
        ...links
          // remove links that are  in the users list
          .filter(
            (link) => !users.some((user) => user.accId === link.accountId),
          )
          .map((link) => ({
            username: link.userName,
            accId: link.accountId,
          })),
      ];
    }
    return links.map((link) => ({
      username: link.userName,
      accId: link.accountId,
    }));
  }, [users]);

  const accountId = useMemo(() => {
    if (currentAccount) {
      return currentAccount.id;
    }
    return null;
  }, [currentAccount]);

  useEffect(() => {
    if (
      (
        list.find((modal) => modal.id === "twitter-auto-retweet")?.data as
          | {
              autoRetweetLinks: {
                userName: string;
                accountId: string;
              }[];
            }
          | undefined
      )?.autoRetweetLinks
    ) {
      setLinks(
        (
          list.find((modal) => modal.id === "twitter-auto-retweet")?.data as
            | {
                autoRetweetLinks: {
                  userName: string;
                  accountId: string;
                }[];
              }
            | undefined
        )?.autoRetweetLinks ?? [],
      );
    }
  }, [list]);

  const handleSave = useCallback(async () => {
    if (accountId) {
      await updateAutoRetweet({
        accountId,
        body: {
          links,
        },
      })
        .unwrap()
        .then(() => {
          toast.success("Auto retweet settings updated successfully");
          dispatch(closeModal("twitter-auto-retweet"));
          setSearch("");
          setLinks([]);
        });
    }
  }, [accountId, links]);

  return (
    <Dialog
      open={list.some((modal) => modal.id === "twitter-auto-retweet")}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          dispatch(closeModal("twitter-auto-retweet"));
          setSearch("");
          setLinks([]);
        }
      }}
    >
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Twitter Auto Retweet</DialogTitle>
          <DialogDescription>
            Use this tool to automatically retweet another Twitter account (e.g.
            company account) when it tweets through Postlyy.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "h-fit w-full flex-wrap justify-between",
                  links.length === 0 && "text-muted-foreground",
                )}
              >
                {links?.length ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {links.map((user) => (
                      <Badge variant="outline">@{user.userName}</Badge>
                    ))}
                  </div>
                ) : (
                  "Select user to retweet"
                )}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search user..."
                  className="h-9"
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandEmpty>No user found.</CommandEmpty>
                <CommandGroup>
                  {usersList.map((user) => (
                    <CommandItem
                      key={user.accId}
                      onSelect={() => {
                        if (
                          !links.some((link) => link.accountId === user.accId)
                        ) {
                          setLinks([
                            ...links,
                            {
                              userName: user.username,
                              accountId: user.accId,
                            },
                          ]);
                        } else {
                          setLinks(
                            links.filter(
                              (link) => link.accountId !== user.accId,
                            ),
                          );
                        }
                      }}
                    >
                      {user.username}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          links.some((link) => link.accountId === user.accId)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            loading={isUpdatingAutoRetweet}
            disabled={isUpdatingAutoRetweet}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
