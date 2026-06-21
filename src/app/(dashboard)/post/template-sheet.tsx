import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import Image from "@/components/ui/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/Spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { env } from "@/env";
import { useAuth } from "@/lib/auth/client";
import { useGetTemplatesQuery } from "@/redux/api/post/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import { format } from "date-fns";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import ErrorCard from "../../../components/error-card";
import { usePagination } from "../../../hooks/usePagination";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  useTemplate: (id: string) => void;
};

export default function TemplateSheet({
  isOpen,
  setIsOpen,
  useTemplate,
}: Props) {
  const dispatch = useAppDispatch();
  const { data: session } = useAuth();
  const { currentAccount } = useAppSelector((state) => state.auth);
  const { pageNumber, pageSize } = usePagination();

  const {
    data: templates,
    isLoading,
    isSuccess,
    refetch,
  } = useGetTemplatesQuery({
    PageNumber: pageNumber,
    PageSize: pageSize,
  });

  const handleUseTemplate = useCallback(
    (id: string) => () => {
      useTemplate(id);
    },
    [],
  );

  const handleDeleteTemplate = useCallback(
    (id: string) => () => {
      dispatch(
        openModal({
          id: "delete-template-modal",
          data: id,
        }),
      );
    },
    [],
  );

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Templates</SheetTitle>
          </SheetHeader>
          <div className="">
            {isLoading ? (
              <div className="flex h-56 items-center justify-center">
                <Spinner />
              </div>
            ) : isSuccess ? (
              templates.data.length > 0 ? (
                <div className="flex flex-col">
                  <div className="flex flex-col">
                    {templates.data.map((template) => (
                      <div className="mb-4 flex flex-col rounded border">
                        <div className="flex items-center justify-between border-b p-1">
                          <p className="text-sm text-muted-foreground">
                            {format(
                              new Date(template.createdAt),
                              "dd MMM yyyy, HH:mm",
                            )}
                          </p>
                          <div className="gap2 flex items-center">
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                  onClick={handleUseTemplate(template.id)}
                                >
                                  <Iconify
                                    icon="solar:square-forward-bold-duotone"
                                    className="text-foreground/80"
                                    fontSize={18}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-center">Use</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                >
                                  <Iconify
                                    icon="solar:trash-bin-2-bold-duotone"
                                    className="text-destructive"
                                    fontSize={18}
                                    onClick={handleDeleteTemplate(template.id)}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-destructive text-destructive-foreground"
                              >
                                <p className="text-center">Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className=" p-2">
                          <div className="my-3 flex items-center gap-2">
                            <Avatar>
                              <AvatarImage
                                src={
                                  currentAccount?.photoUrl
                                    ? currentAccount?.photoUrl
                                    : session?.profilePicture ?? ""
                                }
                                alt={`@${currentAccount?.username}`}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {currentAccount?.username
                                  ?.slice(0, 2)
                                  .toUpperCase() ??
                                  session?.fullName
                                    ?.slice(0, 2)
                                    .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-semibold">
                                {session?.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                @
                                {currentAccount?.username
                                  .toLowerCase()
                                  .split(" ")
                                  .join("")}
                              </p>
                            </div>
                          </div>
                          <p className="mb-2">{template.text}</p>
                          {template.imageLinks.map((image, index) => (
                            <div
                              key={index}
                              className="group relative w-fit overflow-hidden rounded"
                            >
                              <Image
                                src={`${env.NEXT_PUBLIC_API_BASE_URL}/${image}`}
                                alt="image"
                                width={110}
                                height={110}
                                className="rounded object-cover"
                              />
                            </div>
                          ))}
                          {template.gifLink && (
                            <div className="group relative w-fit overflow-hidden rounded">
                              <Image
                                src={`${env.NEXT_PUBLIC_API_BASE_URL}/${template.gifLink}`}
                                alt="image"
                                width={110}
                                height={110}
                                className="rounded object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center">
                  <div className="text-muted-foreground">
                    No templates found
                  </div>
                </div>
              )
            ) : (
              <ErrorCard refetchFunction={refetch} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
