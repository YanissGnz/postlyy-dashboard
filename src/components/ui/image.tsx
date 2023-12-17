import {
  type Effect,
  LazyLoadImage,
  type LazyLoadImageProps,
} from "react-lazy-load-image-component";

// ----------------------------------------------------------------------

interface ImageProps extends LazyLoadImageProps {
  disabledEffect?: boolean;
  effect?: Effect;
  imageClass?: string;
  className?: string;
}

export default function Image({
  disabledEffect = false,
  effect = "opacity",
  className,
  ...other
}: ImageProps) {
  return (
    <LazyLoadImage
      wrapperClassName="wrapper"
      effect={disabledEffect ? undefined : effect}
      placeholderSrc="https://zone-assets-api.vercel.app/assets/img_placeholder.svg"
      className={className}
      {...other}
    />
  );
}

// ----------------------------------------------------------------------
