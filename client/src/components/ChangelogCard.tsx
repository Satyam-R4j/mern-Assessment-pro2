import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ChangelogItem, ReactionType } from '../types/changelog';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Share2, Check, Sparkles, Wrench, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChangelogCardProps {
  item: ChangelogItem;
  onReact: (id: string, emojiType: ReactionType) => Promise<void>;
}

export const ChangelogCard: React.FC<ChangelogCardProps> = ({ item, onReact }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [reacting, setReacting] = useState<ReactionType | null>(null);

  const formattedDate = new Date(item.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'New':
        return (
          <Badge variant="success" className="gap-1 px-2.5 py-0.5">
            <Sparkles className="size-3" />
            New Feature
          </Badge>
        );
      case 'Improved':
        return (
          <Badge variant="info" className="gap-1 px-2.5 py-0.5">
            <Wrench className="size-3" />
            Improvement
          </Badge>
        );
      case 'Fixed':
        return (
          <Badge variant="warning" className="gap-1 px-2.5 py-0.5">
            <Bug className="size-3" />
            Fix
          </Badge>
        );
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  const handleReactionClick = async (emojiType: ReactionType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setReacting(emojiType);
      await onReact(item._id, emojiType);
    } finally {
      setReacting(null);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/feed#${item.slug || item._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasReacted = (emojiType: ReactionType): boolean => {
    if (!user) return false;
    return item.reactions?.[emojiType]?.includes(user._id) ?? false;
  };

  const reactionsList: { type: ReactionType; emoji: string; label: string }[] = [
    { type: 'redHeart', emoji: '❤️', label: 'Love' },
    { type: 'partyPopper', emoji: '🎉', label: 'Celebrate' },
    { type: 'rocket', emoji: '🚀', label: 'Excited' },
  ];

  return (
    <div className="relative pl-6 sm:pl-8 pb-12 last:pb-0 group" id={item.slug || item._id}>
      {/* Vertical timeline line */}
      <div className="absolute left-[7px] sm:left-[11px] top-3 bottom-0 w-[2px] bg-border group-last:hidden" />

      {/* Timeline indicator node */}
      <div className="absolute left-0 sm:left-1 top-2 size-4 rounded-full border-2 border-primary bg-background shadow-xs ring-4 ring-background" />

      <Card className="transition-all hover:shadow-md border-border/80">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {getCategoryBadge(item.category)}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                {formattedDate}
              </span>
            </div>

            <Button
              variant="ghost"
              size="xs"
              onClick={handleCopyLink}
              className="text-muted-foreground hover:text-foreground text-xs gap-1"
              title="Copy link to update"
            >
              {copied ? <Check className="size-3 text-success" /> : <Share2 className="size-3" />}
              {copied ? 'Copied' : 'Share'}
            </Button>
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
            {item.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {item.coverImage && (
            <div className="overflow-hidden rounded-xl border border-border/60 max-h-80 bg-muted">
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="text-sm leading-relaxed text-foreground/90 space-y-3">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mt-4 mb-2 text-foreground">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mt-3 mb-1.5 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-3 space-y-1 text-foreground/90">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-3 space-y-1 text-foreground/90">{children}</ol>
                ),
                li: ({ children }) => <li className="leading-normal">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted/70 p-3 rounded-lg overflow-x-auto text-xs font-mono mb-3 border border-border/50">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-2 text-sm">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {item.contentMarkdown}
            </ReactMarkdown>
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          {/* Reaction Buttons */}
          <div className="flex items-center gap-1.5">
            {reactionsList.map((r) => {
              const count = item.reactions?.[r.type]?.length || 0;
              const active = hasReacted(r.type);

              return (
                <button
                  key={r.type}
                  type="button"
                  disabled={reacting === r.type}
                  onClick={() => handleReactionClick(r.type)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    active
                      ? 'bg-primary/10 border-primary/40 text-primary font-semibold'
                      : 'bg-muted/50 hover:bg-muted border-border/60 text-foreground/80 hover:border-border'
                  }`}
                  title={user ? `${r.label} reaction` : 'Log in to react'}
                >
                  <span className="text-sm leading-none">{r.emoji}</span>
                  <span>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Author info */}
          {item.author && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="size-3.5" />
              <span>{item.author.name}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
