import ErrorCard from "@/components/error-card";
import LoadingCard from "@/components/loading-card";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetNoteQuery } from "@/redux/api/notes/apiSlice";
import { Parser } from "@alkhipce/editorjs-react";
import { type IParser } from "@alkhipce/editorjs-react/dist/types/ParserData";
import { isString } from "lodash";
import { useCallback, useMemo } from "react";

export default function Note({
  noteId,
  closeNote,
}: {
  noteId: string | null;
  closeNote: () => void;
}) {
  const {
    data: note,
    isLoading,
    isSuccess,
    refetch,
  } = useGetNoteQuery(noteId ?? "", {
    skip: !noteId,
    refetchOnMountOrArgChange: true,
  });

  const content = useMemo(() => {
    if (isSuccess) {
      return isString(JSON.parse(note.data.content))
        ? (JSON.parse(JSON.parse(note.data.content) as string) as IParser)
        : (JSON.parse(note.data.content) as IParser);
    }
    return null;
  }, [isSuccess, note]);

  const handleCloseNote = useCallback(() => {
    closeNote();
  }, []);

  if (!noteId) return null;

  if (isLoading)
    return (
      <div className="md:min-w-[400px]">
        <LoadingCard />
      </div>
    );

  if (!isSuccess)
    return (
      <div className="md:min-w-[400px]">
        <ErrorCard title="Note not found" refetchFunction={refetch} />
      </div>
    );

  return (
    <div className="sticky top-0 h-max w-full md:min-w-[400px] md:max-w-lg">
      <ScrollArea
        className="space-y-2 px-4 py-4"
        style={{
          height: "calc(100vh - 120px)",
          maxHeight: "calc(100vh - 120px)",
        }}
      >
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{note.data.name}</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button size="icon" type="button" variant="ghost">
                  <Iconify
                    icon="mdi:close"
                    className="text-destructive"
                    fontSize={18}
                    onClick={handleCloseNote}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-destructive text-destructive-foreground"
              >
                <p className="text-center">Close</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <article className="prose prose-sm mx-auto max-w-4xl dark:prose-invert">
          {content && <Parser data={content} />}
        </article>
      </ScrollArea>
    </div>
  );
}
