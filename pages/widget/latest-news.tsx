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
    <div style={{ fontFamily: 'Arial', fontSize: 13, padding: 10, width: 300, background: '#fff', color: '#000' }}>
      <h3 style={{ marginBottom: 10, fontSize: 16 }}>Последние новости</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {articles.map((item) => (
          <li key={item._id} style={{ marginBottom: 6 }}>
            <a
              href={`https://news1.kz/article/${item.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: '#1a0dab' }}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
