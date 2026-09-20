import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import type { ChangelogItem, ChangelogCategory, ReactionType } from '../types/changelog';
import { ChangelogCard } from '../components/ChangelogCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../context/AuthContext';
import { Search, RefreshCw, Layers, Sparkles, Wrench, Bug, X } from 'lucide-react';

const CATEGORIES: { label: string; value: ChangelogCategory | 'All'; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'All Updates', value: 'All', icon: Layers },
  { label: 'New', value: 'New', icon: Sparkles },
  { label: 'Improved', value: 'Improved', icon: Wrench },
  { label: 'Fixed', value: 'Fixed', icon: Bug },
];

export const Feed: React.FC = () => {
  const { user, markViewed } = useAuth();
  const [items, setItems] = useState<ChangelogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ChangelogCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChangelogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: { category?: string; search?: string } = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get('/changelogs', { params });
      setItems(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch changelog updates';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelogs();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChangelogs();
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      markViewed();
    }
  }, [user]);

  const handleReact = async (id: string, emojiType: ReactionType) => {
    if (!user) return;

    // optimistic UI update
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id !== id) return item;

        const currentList = item.reactions[emojiType] || [];
        const hasReacted = currentList.includes(user._id);

        const updatedList = hasReacted
          ? currentList.filter((uid) => uid !== user._id)
          : [...currentList, user._id];

        return {
          ...item,
          reactions: {
            ...item.reactions,
            [emojiType]: updatedList,
          },
        };
      })
    );

    try {
      const res = await api.post(`/changelogs/${id}/react`, { emojiType });
      // sync with server confirmed reactions list
      if (res.data?.reactions) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === id ? { ...item, reactions: res.data.reactions } : item
          )
        );
      }
    } catch (err) {
      console.error('Failed to submit reaction:', err);
      // rollback on error
      fetchChangelogs();
    }
  };

  const categoryCounts = useMemo(() => {
    const counts = { All: items.length, New: 0, Improved: 0, Fixed: 0 };
    items.forEach((item) => {
      if (item.category in counts) {
        counts[item.category as keyof typeof counts]++;
      }
    });
    return counts;
  }, [items]);

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4 sm:px-6">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
          <Sparkles className="size-3.5" />
          <span>Product Updates & Releases</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          What's New in the App
        </h1>
        <p className="text-muted-foreground mt-2.5 text-base sm:text-lg">
          Follow our latest releases, features, improvements, and bug fixes as we build.
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border/60">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/40">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.value;
            const count = categoryCounts[cat.value];

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted-foreground/15 font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Input
            type="text"
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="error" className="mb-8">
          <AlertTitle>Error loading changelogs</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="xs" variant="outline" onClick={fetchChangelogs} className="gap-1">
              <RefreshCw className="size-3" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-8 pl-6 sm:pl-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-3 rounded-2xl border p-6 bg-card animate-pulse">
              <div className="flex gap-2 items-center">
                <div className="h-5 w-20 bg-muted rounded-full" />
                <div className="h-4 w-28 bg-muted rounded" />
              </div>
              <div className="h-7 w-3/4 bg-muted rounded-md" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card/50">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Layers className="size-6" />
          </div>
          <h3 className="text-lg font-semibold">No updates found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
            {searchQuery || selectedCategory !== 'All'
              ? 'No release notes match your current filter or search criteria.'
              : 'There are currently no published product updates.'}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        /* Timeline Feed */
        <div className="relative mt-2">
          {items.map((item) => (
            <ChangelogCard key={item._id} item={item} onReact={handleReact} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
