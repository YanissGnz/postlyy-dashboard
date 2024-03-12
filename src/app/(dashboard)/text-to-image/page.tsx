"use client";

import BottomButtons from "@/components/bottom-buttons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Output from "editorjs-react-renderer";
import { toPng } from "html-to-image";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
const Editor = dynamic(() => import("@/components/ui/editor"), {
  ssr: false,
  loading() {
    return <Skeleton className="h-[calc(100vh-5rem)] w-full" />;
  },
});

export default function CreateNotePage() {
  const ref = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("null");

  const handleExportToJpeg = useCallback(async () => {
    if (ref.current) {
      await toPng(ref.current, {
        backgroundColor: "white",
        canvasHeight: ref.current.scrollHeight,
        canvasWidth: ref.current.scrollWidth,
        quality: 1,
        pixelRatio: 2,
      }).then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `postlyy-text-to-image-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      });
    }
  }, [ref]);

  return (
    <div className="space-y-2 px-4 py-4 md:px-8">
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1">
          <Editor
            containerClassName="min-h-[calc(100vh-5rem)]"
            onChange={setContent}
          />

          <BottomButtons>
            <Button onClick={handleExportToJpeg}>Export to png</Button>
          </BottomButtons>
        </div>
      </div>
      <div className="sr-only top-0 h-fit w-fit whitespace-normal">
        <div
          ref={ref}
          className="prose min-w-[300px] break-words px-5 !font-sans"
        >
          <Output data={JSON.parse(content ?? "null") as unknown} />
          <div className="flex justify-end p-2 text-xs text-muted-foreground">
            <p>Made with Postlyy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
