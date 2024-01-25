/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import List from "@editorjs/list";
import Warning from "@editorjs/warning";
import Code from "@editorjs/code";
import Link from "@editorjs/link";
import Image from "@editorjs/image";
import Raw from "@editorjs/raw";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import CheckList from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import SimpleImage from "@editorjs/simple-image";
import { env } from "@/types/env";
import { store } from "@/redux/store";

export const EDITOR_JS_TOOLS = {
  embed: Embed,
  table: Table,
  list: List,
  warning: Warning,
  code: Code,
  linkTool: Link,
  image: {
    class: Image,
    config: {
      endpoints: {
        byFile: `${env.NEXT_PUBLIC_API_BASE_URL}/api/NotePosts/AddImage`,
      },
      additionalRequestHeaders: {
        authorization: `Bearer ${
          store.getState().auth.token ?? localStorage.getItem("token")
        }`,
      },
    },
  },
  raw: Raw,
  header: Header,
  quote: Quote,
  marker: Marker,
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
  simpleImage: SimpleImage,
};
