import { PortableText, PortableTextComponents } from '@portabletext/react'
import React from 'react'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-4">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc pl-6">{children}</ul>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal pl-6">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <li className="mb-1">{children}</li>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <li className="mb-1">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-semibold">{children}</strong>
    ),
  },
}

export default function PortableTextRenderer({ value }: { value: any }) {
  return <PortableText value={value} components={components} />
}
