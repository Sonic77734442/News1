// portableTextComponents.tsx
import Image from "next/image";
import { urlFor } from "@/lib/sanityImage";

export const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      const imageUrl = urlFor(value).width(1120).format("webp").url();

      return (
        <div className="relative w-full h-[630px] my-6">
          <Image
            src={imageUrl}
            alt={value.alt || "Article image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1120px"
            className="object-cover rounded-lg"
            priority // если хочешь подгружать раньше
            placeholder="blur"
            blurDataURL="/blur-placeholder.jpg" // можешь сгенерить позже
          />
        </div>
      );
    },
  },
};
