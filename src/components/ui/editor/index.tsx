/* eslint-disable @typescript-eslint/no-floating-promises */
import { cn } from "@/lib/utils";
import EditorJS, { type LogLevels, type OutputData } from "@editorjs/editorjs";
import { default as React, useEffect, useState } from "react";
import { EDITOR_JS_TOOLS } from "./tools";

const EDITOR_HOLDER_ID = "editorjs";

type Props = {
  defaultData?: OutputData;
  onChange: (content: string) => void;
  containerClassName?: string;
  className?: string;
};

const Editor = ({
  defaultData,
  onChange,
  containerClassName,
  className,
}: Props) => {
  const [editorInstance, setEditorInstance] = useState<EditorJS | null>(null);
  const [editorData, setEditorData] = React.useState(defaultData ?? undefined);

  useEffect(() => {
    if (!editorInstance) {
      initEditor();
    }
    return () => {
      editorInstance?.destroy();
      setEditorInstance(null);
    };
  }, []);

  useEffect(() => {
    if (editorInstance?.isReady) {
      editorInstance.focus();
    }
  }, [editorInstance]);

  const initEditor = () => {
    const editor = new EditorJS({
      holder: EDITOR_HOLDER_ID,
      logLevel: "ERROR" as LogLevels,
      data: editorData,
      placeholder: "Start writing...",
      onReady: () => {
        setEditorInstance(editor);
        // editor.focus();
      },
      onChange: () => {
        editor.saver.save().then((outputData) => {
          const content = JSON.stringify(outputData);
          onChange(content);
          setEditorData(outputData);
        });
      },
      tools: EDITOR_JS_TOOLS,
    });
  };

  return (
    <div className={cn("w-full rounded border", containerClassName)} >
      <div
        id={EDITOR_HOLDER_ID}
        className={cn(
          "prose max-w-full p-1 font-sans dark:prose-invert",
          className,
        )}
      ></div>
    </div>
  );
};

export default Editor;
