"use client";

import Image from "next/image";
import { useState } from "react";

export type StageImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function ProductStage({ images }: { images: StageImage[] }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  if (!current) return null;

  return (
    <div>
      <div className="mx-auto w-full max-w-[512px]">
        <Image
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          quality={92}
          priority
          sizes="(max-width: 768px) 92vw, 512px"
          className="piece-shadow h-auto w-full"
        />
      </div>
      {images.length > 1 ? (
        <ul className="mt-6 flex justify-center gap-3">
          {images.map((image, imageIndex) => (
            <li key={image.src}>
              <button
                type="button"
                aria-pressed={imageIndex === index}
                aria-label={`View ${imageIndex + 1}`}
                className={`h-16 w-16 border bg-transparent p-1 ${imageIndex === index ? "border-ink" : "border-line"}`}
                onClick={() => setIndex(imageIndex)}
              >
                <Image
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  quality={92}
                  sizes="64px"
                  className="h-full w-full object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
