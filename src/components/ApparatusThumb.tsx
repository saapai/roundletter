"use client";

import { useState } from "react";

type Props = {
  image?: string;
  palette?: string[];
  alt?: string;
};

export default function ApparatusThumb({ image, palette, alt = "" }: Props) {
  const [errored, setErrored] = useState(false);
  const showImage = image && !errored;
  const gradient =
    palette && palette.length > 0
      ? `linear-gradient(135deg, ${palette.join(", ")})`
      : "linear-gradient(135deg, #d8d2c4, #a89d88)";

  return (
    <div
      className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10"
      style={{ background: gradient }}
      aria-hidden={!showImage}
    >
      {showImage ? (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
