import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, MessageSquare, Send, Share2 } from 'lucide-react';
import { CommunityPost } from '../types';
import { EmptyState } from './EmptyState';

interface CommunitySectionProps {
  posts: CommunityPost[];
  likedPostIds: number[];
  onAddPost: (text: string, topic: CommunityPost['topic']) => void;
  onToggleLike: (postId: number) => void;
  onAddReply: (postId: number, content: string) => void;
  onNotify: (msg: string) => void;
  highlightedId?: number | null;
}

const POST_TOPICS: CommunityPost['topic'][] = [
  'General',
  'Team Search',
  'Project Showcase',
  'Study Group',
];

export const CommunitySection: React.FC<CommunitySectionProps> = ({
  posts,
  likedPostIds,
  onAddPost,
  onToggleLike,
  onAddReply,
  onNotify,
  highlightedId,
}) => {
  const [text, setText] = useState('');
  const [topic, setTopic] = useState<CommunityPost['topic']>('General');
  const [filterTopic, setFilterTopic] = useState<'All' | CommunityPost['topic']>('All');
  const [openRepliesId, setOpenRepliesId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!highlightedId) return;
    setFilterTopic('All');
    const el = document.getElementById(`community-post-${highlightedId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddPost(text.trim(), topic);
    setText('');
  };

  const handleReplySubmit = (e: React.FormEvent, postId: number) => {
    e.preventDefault();
    if (!replyDraft.trim()) return;
    onAddReply(postId, replyDraft.trim());
    setReplyDraft('');
  };

  const handleShare = async (post: CommunityPost) => {
    try {
      await navigator.clipboard.writeText(`${post.name}: "${post.text}"`);
      onNotify('Post copied to clipboard.');
    } catch {
      onNotify('Clipboard unavailable in this browser.');
    }
  };

  const filteredPosts = posts.filter((p) => filterTopic === 'All' || p.topic === filterTopic);

  const initials = (name: string) =>
    (name || 'S')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-indigo-600 dark:text-[#9c88ff]">
          Student Community Board
        </p>
        <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
          Campus discussions.
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          Find hackathon teammates, share project milestones, or organize study tables.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Composer */}
        <section className="lg:col-span-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] p-6 shadow-2xs">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            Share an update
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Visible to peers across campus boards
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="post-topic" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Discussion topic
              </label>
              <select
                id="post-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value as CommunityPost['topic'])}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {POST_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="post-text" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Your message
              </label>
              <textarea
                ref={composerRef}
                id="post-text"
                rows={4}
                maxLength={300}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Looking for a React teammate for Buildathon, or sharing exam notes..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 leading-relaxed focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
                {text.length}/300
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] dark:bg-[#6D5DF6] dark:hover:bg-[#7d6ef8] px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Post update</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </section>

        {/* Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Recent posts
            </h2>

            <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0E1526] border border-slate-200/90 dark:border-slate-800">
              {(['All', ...POST_TOPICS] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilterTopic(item)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    filterTopic === item
                      ? 'bg-white dark:bg-[#1a223f] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => {
                const isLiked = likedPostIds.includes(post.id);
                const likeTotal = post.likes + (isLiked ? 1 : 0);
                const repliesOpen = openRepliesId === post.id;
                const isHighlighted = highlightedId === post.id;

                return (
                  <article
                    id={`community-post-${post.id}`}
                    key={post.id}
                    className={`rounded-2xl border bg-white dark:bg-[#0E1526] p-5 shadow-2xs transition-colors ${
                      isHighlighted
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30 dark:border-[#22D3EE]'
                        : 'border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-300/80 dark:hover:border-indigo-500/35'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 dark:from-[#8169ec] dark:to-[#3b9eaa] text-white font-display text-xs font-bold grid place-items-center shrink-0">
                          {initials(post.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {post.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {post.course} · {post.time}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-medium text-indigo-600 dark:text-[#a894ff] shrink-0">
                        {post.topic}
                      </span>
                    </div>

                    <p className="mt-3.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {post.text}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onToggleLike(post.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded ${
                          isLiked
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="font-mono-tabular">{likeTotal} likes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenRepliesId(repliesOpen ? null : post.id);
                          setReplyDraft('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Replies</span>
                        <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#171f3b] font-mono-tabular text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                          {post.replies.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(post)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>

                    {repliesOpen && (
                      <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
                        {post.replies.length > 0 && (
                          <div className="space-y-2.5">
                            {post.replies.map((reply) => (
                              <div key={reply.id} className="text-xs text-slate-700 dark:text-slate-300">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {reply.author}
                                </span>{' '}
                                <span className="text-slate-400 dark:text-slate-500">· {reply.time}</span>
                                <p className="mt-0.5 text-slate-600 dark:text-slate-400">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <form onSubmit={(e) => handleReplySubmit(e, post.id)} className="flex gap-2">
                          <input
                            type="text"
                            required
                            maxLength={200}
                            value={replyDraft}
                            onChange={(e) => setReplyDraft(e.target.value)}
                            placeholder="Write a helpful reply..."
                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-[#6D5DF6] text-xs font-semibold text-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            Reply
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <EmptyState
                icon={MessageSquare}
                headline={posts.length === 0 ? 'No campus updates yet' : 'No posts in this topic'}
                subline={
                  posts.length === 0
                    ? 'Share a project update, study table, or team search.'
                    : 'Switch topics or start a new conversation on the left.'
                }
                ctaLabel={posts.length === 0 ? 'Write first update' : 'Show all posts'}
                onCtaClick={() => {
                  if (posts.length === 0) {
                    composerRef.current?.focus();
                  } else {
                    setFilterTopic('All');
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
