import { useEffect, useState } from 'react';
import { fetchCategoryPosts } from '@/lib/sanity';
import PostCard from './PostCard';

export default function SportNews() {
  const [posts, setPosts] = useState([]);

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
