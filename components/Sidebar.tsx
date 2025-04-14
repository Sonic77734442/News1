'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Send } from 'lucide-react'
import { sanity } from '@/lib/sanity'
import SidebarAd from './SidebarAd'

type Post = {
  _id: string
  title: string
  slug: { current: string }
}

export default function Sidebar() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchLatestPosts = async () => {
      const query = `*[_type == "post"] | order(publishedAt desc)[0...5] {
        _id,
        title,
        slug
      }`
      const data = await sanity.fetch(query)
      setLatestPosts(data)
    }

    fetchLatestPosts()
  }, [])

  return (
    <aside className="lg:sticky top-24 h-fit space-y-6 hidden lg:block">
      <SidebarAd />

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-2">Мы в соцсетях</h3>
        <div className="flex space-x-4">
          <Link href="https://facebook.com/newssitekz" target="_blank" rel="noopener noreferrer">
            <Facebook className="w-5 h-5 hover:text-blue-600 transition" />
          </Link>
          <Link href="https://t.me/your_channel" target="_blank" rel="noopener noreferrer">
            <Send className="w-5 h-5 hover:text-blue-400 transition" />
          </Link>
          <Link href="https://instagram.com/your_page" target="_blank" rel="noopener noreferrer">
            <Instagram className="w-5 h-5 hover:text-pink-500 transition" />
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-2">Популярное</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
          {latestPosts.map(post => (
            <li key={post._id}>
              <Link href={`/article/${post.slug.current}`} className="hover:underline block">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
