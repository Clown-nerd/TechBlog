import React from 'react';

interface CommentUser {
  id?: number;
  name?: string;
  display_name?: string;
  avatar_url?: string | null;
}

export interface CommentType {
  id: number;
  parent_comment_id: number | null;
  body: string;
  created_at: string;
  is_deleted?: boolean;
  user?: CommentUser;
  author?: CommentUser;
  replies?: CommentType[];
}

function CommentItem({ comment }: { comment: CommentType }) {
  const authorName = comment.user?.display_name || comment.user?.name || comment.author?.display_name || comment.author?.name || 'Anonymous';
  const avatarUrl = comment.user?.avatar_url || comment.author?.avatar_url;
  const isDeleted = comment.is_deleted;
  
  const date = new Date(comment.created_at).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="comment-item" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div 
          className="comment-avatar" 
          style={{
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--border)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            overflow: 'hidden'
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={authorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            authorName.charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <strong style={{ color: 'var(--char)' }}>{isDeleted ? '[Deleted]' : authorName}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{date}</span>
          </div>
          <div className="comment-body" style={{ color: 'var(--text)', lineHeight: 1.5, fontSize: '0.95rem' }}>
            {isDeleted ? <span style={{ fontStyle: 'italic', color: 'var(--muted)' }}>This comment has been deleted.</span> : comment.body}
          </div>
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="comment-replies" style={{ marginTop: '1.5rem', borderLeft: '2px solid var(--border)', paddingLeft: '1.5rem' }}>
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentsSection({ comments = [] }: { comments?: CommentType[] }) {
  // If the backend returns a flat array, we need to build the tree.
  // If it already returns a nested array (with `replies`), this will handle it as well.
  
  const buildTree = (flatComments: CommentType[]) => {
    const map = new Map<number, CommentType>();
    const roots: CommentType[] = [];

    // First pass: initialize map and ensure replies array exists
    flatComments.forEach(c => {
      map.set(c.id, { ...c, replies: c.replies || [] });
    });

    // Second pass: build tree
    map.forEach(c => {
      if (c.parent_comment_id) {
        const parent = map.get(c.parent_comment_id);
        if (parent) {
          parent.replies!.push(c);
        } else {
          // Fallback if parent is missing
          roots.push(c);
        }
      } else {
        roots.push(c);
      }
    });

    return roots;
  };

  const isFlat = comments.some(c => c.parent_comment_id && !comments.some(p => p.replies?.some(r => r.id === c.id)));
  const hierarchicalComments = isFlat ? buildTree(comments) : comments;

  if (!comments || comments.length === 0) {
    return (
      <div className="comments-section" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Comments</h3>
        <p style={{ color: 'var(--muted)' }}>No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="comments-section" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
      <h3 style={{ marginBottom: '2rem' }}>Comments ({comments.length})</h3>
      <div className="comments-list">
        {hierarchicalComments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
