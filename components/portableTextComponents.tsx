import Image from "next/image";
import { PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/lib/sanityImage";

export const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4">{children}</p>,
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold mb-4">{children}</h3>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-1">{children}</li>,
    number: ({ children }) => <li className="mb-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
  },
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
            priority
            placeholder="blur"
            blurDataURL="/blur-placeholder.jpg"
          />
        </div>
      );
    },
  },
};
