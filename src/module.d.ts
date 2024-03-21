/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "@editorjs/embed" {
  const Embed: any;
  export = Embed;
}

declare module "@editorjs/table" {
  const Table: any;
  export = Table;
}

declare module "@editorjs/list" {
  const List: any;
  export = List;
}

declare module "@editorjs/warning" {
  const Warning: any;
  export = Warning;
}

declare module "@editorjs/code" {
  const Code: any;
  export = Code;
}

declare module "@editorjs/link" {
  const Link: any;
  export = Link;
}

declare module "@editorjs/image" {
  const Image: any;
  export = Image;
}

declare module "@editorjs/raw" {
  const Raw: any;
  export = Raw;
}

declare module "@editorjs/header" {
  const Header: any;
  export = Header;
}

declare module "@editorjs/quote" {
  const Quote: any;
  export = Quote;
}

declare module "@editorjs/marker" {
  const Marker: any;
  export = Marker;
}

declare module "@editorjs/checklist" {
  const CheckList: any;
  export = CheckList;
}

declare module "@editorjs/delimiter" {
  const Delimiter: any;
  export = Delimiter;
}

declare module "@editorjs/inline-code" {
  const InlineCode: any;
  export = InlineCode;
}

declare module "@editorjs/simple-image" {
  const SimpleImage: any;
  export = SimpleImage;
}

declare module "editorjs-text-color-plugin" {
  const ColorPlugin: any;
  export = ColorPlugin;
}
// import { TypeAnimation } from "react-type-animation";

type TypeAnimationProps = {
  sequence: string[];
  wrapper?: string;
  speed?:
    | number
    | {
        type: "keyStrokeDelayInMs";
        value: number;
      };
  deletionSpeed?:
    | number
    | {
        type: "keyStrokeDelayInMs";
        value: number;
      };
  omitDeletionAnimation?: boolean;
  repeat?: boolean;
  cursor?: boolean;
  preRenderFirstString?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<any>;
  splitter?: (text: string) => string[];
};
declare module "react-type-animation" {
  function TypeAnimation(props: TypeAnimationProps): JSX.Element;

  export { TypeAnimation };
}
