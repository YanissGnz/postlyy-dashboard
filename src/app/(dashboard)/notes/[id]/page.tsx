"use client";

import { Spinner } from "@/components/ui/Spinner";
import React, { useMemo } from "react";
import { Parser } from "@alkhipce/editorjs-react";
import { type IParser } from "@alkhipce/editorjs-react/dist/types/ParserData";
import { useGetNoteQuery } from "../../../../redux/api/notes/apiSlice";

export default function page({ params }: { params: { id: string } }) {
  const {
    data: note,
    isLoading: isLoadingBlog,
    isSuccess,
  } = useGetNoteQuery(params.id);

  const content = useMemo(() => {
    if (isSuccess) {
      return JSON.parse(note.data.content) as IParser;
    }
    return null;
  }, [isSuccess, note]);

  return (
    <>
      {isLoadingBlog ? (
        <div className="flex h-56 items-center justify-center">
          <Spinner />
        </div>
      ) : isSuccess && content ? (
        <div className="space-y-2 px-4 py-4 md:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{note.data.name}</h2>
          </div>
          <article className="prose dark:prose-invert mx-auto max-w-4xl ">
            <Parser data={content} />
          </article>
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center">
          <p>Blog not found</p>
        </div>
      )}
    </>
  );
}
