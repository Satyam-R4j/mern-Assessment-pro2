import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import type { ChangelogItem, ChangelogCategory } from '../types/changelog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  Wrench,
  Bug,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';

const CATEGORIES: ChangelogCategory[] = ['New', 'Improved', 'Fixed'];

export const Admin = () => {
  const [changelogs, setChangelogs] = useState<ChangelogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [category, setCategory] = useState<ChangelogCategory>('New');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Published');
  const [coverImage, setCoverImage] = useState('');

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const formRef = useRef<HTMLDivElement>(null);

  const fetchChangelogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/changelogs/admin/all');
      setChangelogs(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load changelog items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelogs();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContentMarkdown('');
    setCategory('New');
    setStatus('Published');
    setCoverImage('');
    setError('');
    setSuccess('');
  };

  const handleEdit = (item: ChangelogItem) => {
    setEditingId(item._id);
    setTitle(item.title);
    setContentMarkdown(item.contentMarkdown);
    setCategory(item.category);
    setStatus(item.status);
    setCoverImage(item.coverImage || '');
    setError('');
    setSuccess('');

    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentMarkdown.trim()) {
      setError('Title and markdown content are required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      title: title.trim(),
      contentMarkdown: contentMarkdown.trim(),
      category,
      status,
      coverImage: coverImage.trim(),
    };

    try {
      if (editingId) {
        const res = await api.put(`/changelogs/admin/${editingId}`, payload);
        setChangelogs((prev) =>
          prev.map((c) => (c._id === editingId ? { ...c, ...res.data } : c))
        );
        setSuccess('Changelog updated successfully');
      } else {
        const res = await api.post('/changelogs/admin', payload);
        setChangelogs((prev) => [res.data, ...prev]);
        setSuccess('Changelog release published successfully');
      }
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save changelog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this release note?')) return;

    try {
      await api.delete(`/changelogs/admin/${id}`);
      setChangelogs((prev) => prev.filter((c) => c._id !== id));
      if (editingId === id) resetForm();
      setSuccess('Changelog post deleted');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete post');
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'New':
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <Sparkles className="size-3" /> New
          </Badge>
        );
      case 'Improved':
        return (
          <Badge variant="info" size="sm" className="gap-1">
            <Wrench className="size-3" /> Improved
          </Badge>
        );
      case 'Fixed':
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <Bug className="size-3" /> Fixed
          </Badge>
        );
      default:
        return <Badge variant="secondary" size="sm">{cat}</Badge>;
    }
  };

  const publishedCount = changelogs.filter((c) => c.status === 'Published').length;
  const draftCount = changelogs.filter((c) => c.status === 'Draft').length;

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/70">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Studio</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create, preview, and manage product release updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-muted/60 px-3 py-1.5 rounded-lg border border-border/50">
            <span className="font-semibold text-foreground">{changelogs.length}</span>
            <span className="text-muted-foreground">total</span>
            <span className="text-border">|</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{publishedCount}</span>
            <span className="text-muted-foreground">published</span>
            <span className="text-border">|</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{draftCount}</span>
            <span className="text-muted-foreground">drafts</span>
          </div>

          <Button
            size="sm"
            onClick={resetForm}
            variant={editingId ? 'default' : 'outline'}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>New Release</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-300">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div ref={formRef} className="mb-12">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <span>{editingId ? 'Edit Release Note' : 'Draft New Release'}</span>
              </CardTitle>

              {editingId && (
                <Button size="xs" variant="ghost" onClick={resetForm}>
                  Cancel Editing
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-8 space-y-2">
                  <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider">
                    Release Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. v2.4.0 — Instant Search & Dark Mode Support"
                    required
                  />
                </div>

                <div className="md:col-span-4 space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Category
                  </Label>
                  <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/40">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                          category === cat
                            ? 'bg-background text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Publication Status
                  </Label>
                  <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/40">
                    {(['Published', 'Draft'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                          status === st
                            ? 'bg-background text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-8 space-y-2">
                  <Label htmlFor="coverImage" className="text-xs font-semibold uppercase tracking-wider">
                    Cover Image URL (Optional)
                  </Label>
                  <Input
                    id="coverImage"
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="markdown" className="text-xs font-semibold uppercase tracking-wider">
                    Release Content (Markdown) *
                  </Label>

                  <div className="flex sm:hidden items-center gap-1 p-0.5 bg-muted rounded-md text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('write')}
                      className={`px-2 py-0.5 rounded ${
                        activeTab === 'write' ? 'bg-background shadow-xs font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-2 py-0.5 rounded ${
                        activeTab === 'preview' ? 'bg-background shadow-xs font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`${activeTab === 'write' ? 'block' : 'hidden sm:block'}`}>
                    <Textarea
                      id="markdown"
                      value={contentMarkdown}
                      onChange={(e) => setContentMarkdown(e.target.value)}
                      placeholder={`### What changed in this update?\n- Added lightning fast instant search\n- Upgraded UI styling to Coss UI primitives\n- Bug fixes for mobile responsiveness`}
                      className="min-h-[280px] font-mono text-xs leading-relaxed"
                      required
                    />
                  </div>

                  <div
                    className={`${
                      activeTab === 'preview' ? 'block' : 'hidden sm:block'
                    } rounded-lg border border-border/70 bg-card p-4 min-h-[280px] overflow-y-auto max-h-[360px] text-xs text-foreground/90`}
                  >
                    {contentMarkdown.trim() ? (
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1.5 text-foreground">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1 text-foreground">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-semibold mt-1.5 mb-0.5 text-foreground">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-normal">{children}</li>,
                          code: ({ children }) => (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-primary">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-muted/70 p-2.5 rounded text-[11px] font-mono mb-2 overflow-x-auto border">
                              {children}
                            </pre>
                          ),
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {contentMarkdown}
                      </ReactMarkdown>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 py-12">
                        <Eye className="size-6 mb-2 opacity-40" />
                        <p className="text-xs">Live markdown preview will render here...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                  Clear
                </Button>
                <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  <span>{saving ? 'Saving...' : editingId ? 'Update Release' : 'Publish Release'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <span>All Changelog Entries</span>
          </h2>
          <span className="text-xs text-muted-foreground">{changelogs.length} releases</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-4 rounded-xl border bg-card animate-pulse flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
                <div className="h-8 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : changelogs.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-card/40 text-muted-foreground">
            <p className="text-sm">No releases created yet. Use the studio form above to publish one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground/90">
                {changelogs.map((item) => {
                  const dateStr = item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Not published';

                  return (
                    <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-sm text-foreground truncate">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate font-mono">/{item.slug}</p>
                      </td>

                      <td className="py-3 px-4">{getCategoryBadge(item.category)}</td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={item.status === 'Published' ? 'success' : 'secondary'}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="gap-1 text-muted-foreground hover:text-foreground"
                            title="Edit release"
                          >
                            <Edit2 className="size-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>

                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleDelete(item._id)}
                            className="gap-1 text-muted-foreground hover:text-destructive"
                            title="Delete release"
                          >
                            <Trash2 className="size-3" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
