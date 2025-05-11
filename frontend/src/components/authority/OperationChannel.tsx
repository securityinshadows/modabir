import React from 'react';
import { fetchPosts, createPost, deletePost } from '../../api/operationsapi';
import { Operation, Post } from '../../utils/types';
import './OperationChannel.css';

interface OperationChannelProps {
  operationId: string;
  operation: Operation;
  onClose: () => void;
}

const OperationChannel: React.FC<OperationChannelProps> = ({ operationId, operation, onClose }) => {
  const { name: operationName, status: operationStatus, createdAt: operationCreatedAt } = operation;

  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [newPostContent, setNewPostContent] = React.useState<string>('');
  const [imageUrl, setImageUrl] = React.useState<string>('');

  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await fetchPosts(operationId);
        if (isMounted) {
          setPosts(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError('Failed to fetch posts');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [operationId]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !imageUrl.trim()) return;

    setError(null);

    const postData = {
      content: newPostContent,
      media: imageUrl ? [imageUrl] : [],
    };

    try {
      const newPost = await createPost(operationId, postData);
      setPosts((prev) => [newPost, ...prev]);
      setNewPostContent('');
      setImageUrl('');
    } catch {
      setError('Failed to create post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(operationId, postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch {
      setError('Failed to delete post');
    }
  };

  return (
    <div className="operation-channel">
      <div className="operation-channel-header">
        <button className="operation-channel-back-button" onClick={onClose}>←</button>
        <div className="operation-channel-info">
          <h2>{operationName}</h2>
          <div className="operation-channel-meta">
            <span className={`status-badge ${operationStatus.toLowerCase()}`}>
              {operationStatus}
            </span>
            <span>{posts.length} posts</span>
            <span>Created: {new Date(operationCreatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="operation-channel-content">
        {loading && <div className="loading">Loading posts...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="post-list">
              {posts.map((post) => (
                <div key={post._id} className="post-item">
                  <div className="post-content">{post.content}</div>
                  {post.media && post.media.length > 0 && (
                    <div className="post-media">
                      {post.media.map((mediaUrl, index) => (
                        <img key={index} src={mediaUrl} alt={`Media ${index + 1}`} />
                      ))}
                    </div>
                  )}
                  <div className="post-actions">
                    <button
                      className="delete-button"
                      onClick={() => handleDeletePost(post._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="operation-channel-new-post">
              <textarea
                placeholder="Write a new post..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="operation-channel-image-url">
                <input
                  type="text"
                  placeholder="Add image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <button
                className="operation-channel-post-button"
                onClick={handleCreatePost}
              >
                Post
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OperationChannel;