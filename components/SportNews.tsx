import { useEffect, useState } from 'react';
import { fetchCategoryPosts } from '@/lib/sanity';
import PostCard from './PostCard';

type PostType = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  publishedAt?: string;
  mainImage?: { asset?: { url?: string } };
  description?: string;
  author?: { name?: string };
  category?: { slug?: { current?: string } };
};

export default function SportNews() {
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      const sportPosts = await fetchCategoryPosts('sport', 0, 4);
      setPosts(sportPosts);
    };

    loadPosts();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
