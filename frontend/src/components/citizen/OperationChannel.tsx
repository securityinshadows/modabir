import React, { useState, useEffect } from 'react';
import { fetchPosts } from '../../api/operationsapi';
import { Operation, Post } from '../../utils/types';
import '../authority/OperationChannel.css';

interface OperationChannelProps {
  operationId: string;
  operation: Operation;
  onClose: () => void;
}

const OperationChannel: React.FC<OperationChannelProps> = ({ operationId, operation, onClose }) => {
  const { name: operationName, status: operationStatus, createdAt: operationCreatedAt } = operation;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationChannel;