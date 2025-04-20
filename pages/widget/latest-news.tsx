// pages/widget/latest-news.tsx

import { useEffect, useState } from 'react'
import { sanity } from '@/lib/sanity'
import { getLatestNewsForWidget } from '@/lib/queries'

export default function LatestNewsWidget() {
  const [articles, setArticles] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await sanity.fetch(getLatestNewsForWidget())
      setArticles(data)
    }
    fetchData()
  }, [])

  return (
    <div
      style={{
        fontFamily: 'Arial',
        padding: 10,
        background: '#fff',
        color: '#000',
        overflowX: 'auto',
        display: 'flex',
        gap: 12,
        scrollbarWidth: 'none',
      }}
    >
      {articles.map((item) => (
        <a
          key={item._id}
          href={`https://news1.kz/article/${item.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: '0 0 auto',
            width: 200,
            borderRadius: 8,
            background: '#f8f8f8',
            textDecoration: 'none',
            color: '#000',
            boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '100%', height: 100, objectFit: 'cover' }}
            />
          )}
          <div style={{ padding: '8px', fontSize: 13 }}>{item.title}</div>
        </a>
      ))}
    </div>
  )
}

