import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useWidget } from '../context/WidgetContext';
import { useAuth } from '../context/AuthContext';
import type { ChangelogItem, ReactionType } from '../types/changelog';
import {
  Sheet,
  SheetPopup,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetPanel,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Wrench, Bug, ArrowRight, ExternalLink, Calendar } from 'lucide-react';

export const ChangelogWidget: React.FC = () => {
  const { isOpen, closeWidget } = useWidget();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<ChangelogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWidgetUpdates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/changelogs');
      setItems(res.data.slice(0, 6));
    } catch (err) {
      console.log('load widget updates err:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWidgetUpdates();
    }
  }, [isOpen]);

  const handleReact = async (id: string, emojiType: ReactionType) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;
        const userKey = user ? user._id : 'guest';
        const current = item.reactions[emojiType] || [];
        const exists = current.includes(userKey);
        const updated = exists ? current.filter((k) => k !== userKey) : [...current, userKey];

        return {
          ...item,
          reactions: {
            ...item.reactions,
            [emojiType]: updated,
          },
        };
      })
    );

    try {
      const res = await api.post(`/changelogs/${id}/react`, { emojiType });
      if (res.data?.reactions) {
        setItems((prev) =>
          prev.map((item) => (item._id === id ? { ...item, reactions: res.data.reactions } : item))
        );
      }
    } catch (err) {
      console.log('widget react err:', err);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'New':
        return (
          <Badge variant="success" size="sm" className="gap-1 px-2 py-0">
            <Sparkles className="size-3" />
            New
          </Badge>
        );
      case 'Improved':
        return (
          <Badge variant="info" size="sm" className="gap-1 px-2 py-0">
            <Wrench className="size-3" />
            Improved
          </Badge>
        );
      case 'Fixed':
        return (
          <Badge variant="warning" size="sm" className="gap-1 px-2 py-0">
            <Bug className="size-3" />
            Fixed
          </Badge>
        );
      default:
        return <Badge variant="secondary" size="sm">{category}</Badge>;
    }
  };

  const reactionsList: { type: ReactionType; emoji: string }[] = [
    { type: 'redHeart', emoji: '❤️' },
    { type: 'partyPopper', emoji: '🎉' },
    { type: 'rocket', emoji: '🚀' },
  ];

  const handleViewAll = () => {
    closeWidget();
    navigate('/');
  };

  const handleOpenItem = (slugOrId: string) => {
    closeWidget();
    navigate(`/#${slugOrId}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && closeWidget()}>
      <SheetPopup side="right" className="w-full sm:max-w-md flex flex-col h-full bg-background">
        <SheetHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <SheetTitle className="text-lg font-bold">What's New</SheetTitle>
              <SheetDescription className="text-xs">
                Product releases & recent changelogs
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <SheetPanel className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-xl border bg-card animate-pulse space-y-2.5">
                  <div className="flex gap-2">
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-5 w-4/5 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No updates published yet.</p>
            </div>
          ) : (
            items.map((item) => {
              const formattedDate = new Date(item.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <article
                  key={item._id}
                  className="rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-border hover:shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(item.category)}
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="size-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenItem(item.slug || item._id)}
                      className="text-muted-foreground hover:text-foreground text-xs inline-flex items-center gap-0.5 cursor-pointer"
                      title="View in full feed"
                    >
                      <ExternalLink className="size-3" />
                    </button>
                  </div>

                  <h3
                    onClick={() => handleOpenItem(item.slug || item._id)}
                    className="font-semibold text-sm sm:text-base leading-snug cursor-pointer hover:text-primary transition-colors"
                  >
                    {item.title}
                  </h3>

                  {item.coverImage && (
                    <div className="overflow-hidden rounded-lg border border-border/50 max-h-36 bg-muted">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1">{children}</p>,
                        h1: ({ children }) => <strong className="font-semibold">{children} </strong>,
                        h2: ({ children }) => <strong className="font-semibold">{children} </strong>,
                        h3: ({ children }) => <strong className="font-semibold">{children} </strong>,
                        code: ({ children }) => (
                          <code className="bg-muted px-1 py-0.2 rounded text-[11px] font-mono">
                            {children}
                          </code>
                        ),
                        a: ({ children }) => <span className="text-primary">{children}</span>,
                      }}
                    >
                      {item.contentMarkdown}
                    </ReactMarkdown>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {reactionsList.map((r) => {
                        const count = item.reactions?.[r.type]?.length || 0;
                        const userKey = user ? user._id : 'guest';
                        const active = item.reactions?.[r.type]?.includes(userKey) ?? false;

                        return (
                          <button
                            key={r.type}
                            type="button"
                            onClick={() => handleReact(item._id, r.type)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-all cursor-pointer ${
                              active
                                ? 'bg-primary/15 border-primary/40 text-primary font-semibold'
                                : 'bg-muted/40 hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <span>{r.emoji}</span>
                            <span>{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenItem(item.slug || item._id)}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Read full update
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </SheetPanel>

        <SheetFooter className="border-t border-border/60 p-4 bg-muted/30">
          <Button onClick={handleViewAll} className="w-full gap-2" size="sm">
            <span>View All Updates in Feed</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
};

export default ChangelogWidget;
