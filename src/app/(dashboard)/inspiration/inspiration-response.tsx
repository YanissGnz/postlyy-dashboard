import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertToUTC } from "@/lib/utils";
import { useAddNoteMutation } from "@/redux/api/notes/apiSlice";
import { useAddPostNowMutation } from "@/redux/api/post/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { ROUTES } from "@/routes";
import { type TPost } from "@/types/TPostForm";
import { type IParser } from "@alkhipce/editorjs-react/dist/types/ParserData";
import { addDays } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { toast } from "sonner";
import { useBoolean, useCopyToClipboard } from "usehooks-ts";

const TWITTER_TEXT_MAX_LENGTH = 280;

export default function InspirationResponse({ text }: { text: string }) {
  const currentAccount = useAppSelector((state) => state.auth.currentAccount);
  const session = useSession();
  const { push } = useRouter();
  const [name, setName] = useState("");
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);
  const { value: isNoteDialogOpen, setValue: setIsNoteDialogOpen } =
    useBoolean(false);
  const { value: isDraftDialogOpen, setValue: setIsDraftDialogOpen } =
    useBoolean(false);

  const [_, copy] = useCopyToClipboard();

  const [addNote] = useAddNoteMutation();
  const [saveDraft] = useAddPostNowMutation();
  const handleUseInspiration = useCallback(() => {
    localStorage.setItem("inspiration", text);
    push(ROUTES.post.create + "?inspiration=true");
  }, [text]);

  const handleCopyText = useCallback(async () => {
    await copy(text);
    toast.success("Text copied to clipboard");
  }, [text]);

  const handleSaveNote = useCallback(() => {
    if (name === "") return;

    const data = new FormData();
    data.append("Name", name);

    const content: IParser = {
      time: Date.now(),
      blocks: [
        {
          type: "paragraph",
          data: {
            text,
          },
          id: Math.random().toString(36),
        },
      ],
      version: "2.28.2",
    };

    data.append("Content", JSON.stringify(content));

    const addNotePromise = addNote(data).unwrap();
    setIsNoteDialogOpen(false);
    toast.promise(addNotePromise, {
      loading: "Saving note...",
      success: () => {
        setName("");
        return "Note saved successfully";
      },
      error: "Error saving note",
    });
  }, [name, text]);

  const splitText = useCallback((text: string, i: number): Array<TPost> => {
    if (text.length > TWITTER_TEXT_MAX_LENGTH) {
      const remainingText = text.slice(TWITTER_TEXT_MAX_LENGTH);

      const newThreads: TPost[] = [
        {
          index: i,
          text: text.slice(0, TWITTER_TEXT_MAX_LENGTH),
          gif: "",
          gifLink: "",
          images: [],
          imageLinks: [],
          poll: null,
          twitterDirectLink: false,
        },
        ...splitText(remainingText, i + 1),
      ];
      return newThreads;
    } else
      return [
        {
          index: i,
          text,
          gif: "",
          gifLink: "",
          images: [],
          imageLinks: [],
          poll: null,
          twitterDirectLink: false,
        },
      ];
  }, []);

  const handleSaveDraft = useCallback(async () => {
    setIsDraftDialogOpen(false);

    const posts = splitText(text, 0);

    const data = new FormData();

    posts.forEach((post, index) => {
      data.append(`Posts[${index}].index`, post.index.toString());
      data.append(`Posts[${index}].text`, post.text);
      data.append(`Posts[${index}].twitterDirectLink`, "false");
    });

    data.append("isDraft", "true");
    data.append("isTemplate", "false");
    data.append(
      "ScheduleDate",
      scheduleDate
        ? convertToUTC(scheduleDate)
        : convertToUTC(addDays(new Date(), 7).toISOString()),
    );
    data.append("AsEvergreen", "false");
    data.append("OnLinkedIn", "true");
    data.append("OnTwitter", "true");

    const saveDraftPromise = saveDraft(data).unwrap();
    toast.promise(saveDraftPromise, {
      loading: "Saving draft...",
      success: () => {
        setScheduleDate("");
        return "Saved draft!";
      },
      error: "Something went wrong",
    });

    setScheduleDate("");
  }, [scheduleDate]);

  return (
    <div className="flex flex-1 flex-col p-2 ">
      <div className="flex-1">
        <div className="my-3 flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={
                currentAccount?.photoUrl ??
                session.data?.user.profilePicture ??
                ""
              }
              alt={`@${
                currentAccount?.username ?? session.data?.user.fullName
              }`}
              className="object-cover"
            />
            <AvatarFallback>
              {currentAccount?.username?.slice(0, 2).toUpperCase() ??
                session.data?.user.fullName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold">
              {session.data?.user.fullName}
            </p>
            <p className="text-xs text-gray-500">
              @{currentAccount?.username.toLowerCase().replace(/\s/g, "")}
            </p>
          </div>
        </div>
        <div className="mb-2">
          <TypeAnimation
            sequence={[text]}
            wrapper="span"
            speed={99}
            cursor={false}
          />
        </div>
      </div>
      <div className="flex w-full justify-end gap-2">
        <Button variant="outline" onClick={handleCopyText}>
          Copy text
        </Button>
        <Dialog open={isDraftDialogOpen} onOpenChange={setIsDraftDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Save as draft</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as draft</DialogTitle>
            </DialogHeader>
            <div>
              <Label htmlFor="date" className="text-right">
                Reminder date
              </Label>
              <Input
                id="date"
                value={scheduleDate ?? ""}
                type="datetime-local"
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Close</Button>
              </DialogClose>
              <Button onClick={handleSaveDraft}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogTrigger>
            <Button variant="outline">Save as note</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as note</DialogTitle>
            </DialogHeader>
            <div>
              <Label htmlFor="name" className="text-right">
                Note name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Close</Button>
              </DialogClose>
              <Button onClick={handleSaveNote}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="default" onClick={handleUseInspiration}>
          Post this inspiration
        </Button>
      </div>{" "}
    </div>
  );
}
