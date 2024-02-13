"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Parser } from "@alkhipce/editorjs-react";
import { type IParser } from "@alkhipce/editorjs-react/dist/types/ParserData";
import { toPng } from "html-to-image";
import BottomButtons from "@/components/bottom-buttons";
const Editor = dynamic(() => import("@/components/ui/editor"), {
  ssr: false,
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
        link.download = `postlyy-image-to-text-${Date.now()}.jpeg`;
        link.href = dataUrl;
        link.click();
      });
    }
  }, [ref]);

  return (
    <div className="space-y-2 px-4 py-4 md:px-8">
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1">
          <Editor onChange={setContent} />

          <BottomButtons>
            <Button onClick={handleExportToJpeg}>Export to jpeg</Button>
          </BottomButtons>
        </div>
      </div>
      <div className="sr-only">
        <div ref={ref} className="prose px-5">
          <Parser data={JSON.parse(content ?? "null") as IParser} />
          <div className="flex justify-end p-2">
            <p>Made by Postlyy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
