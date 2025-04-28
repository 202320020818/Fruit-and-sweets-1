import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <div className='group relative w-full border border-teal-500 hover:border-2 h-[400px] overflow-hidden rounded-lg sm:w-[430px] transition-all'>
      {/* Post Image */}
      {post.image && (
        <img
          src={post.image}
          alt='post cover'
          className='h-[260px] w-full object-cover group-hover:h-[200px] transition-all duration-300'
        />
      )}

      {/* Post Content */}
      <div className='p-3 flex flex-col gap-2'>
        <p className='text-lg font-semibold line-clamp-2'>{post.title}</p>
        {post.category && (
          <span className='italic text-sm'>{post.category}</span>
        )}
        <p className='text-gray-600 text-sm line-clamp-3'>{post.description}</p>
      </div>
    </div>
  );
}
