"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/providers/query-provider";
import { fetchNews, createNews, updateNews, deleteNews } from "@/actions/news";
import { NewsItem } from "@/types/news";
import { fetchCategories } from "@/actions/categories";
import { getCompetitions } from "@/actions/competitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FormState = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image: string;
  youtube_url: string;
  is_featured: boolean;
  competition_id: string;
  category_id: string;
  meta_title: string;
  meta_description: string;
  published_at: string;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  cover_image: "",
  youtube_url: "",
  is_featured: false,
  competition_id: "",
  category_id: "",
  meta_title: "",
  meta_description: "",
  published_at: "",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function NewsManager({ initialNews }: { initialNews: NewsItem[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: news = [], isLoading: isNewsLoading } = useQuery({
    queryKey: ["news"],
    queryFn: fetchNews,
    initialData: initialNews,
  });

  const { data: competitions = [], isLoading: isCompetitionsLoading } = useQuery({
    queryKey: ["competitions"],
    queryFn: getCompetitions,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const sortedNews = useMemo(
    () => [...news].sort((a, b) => (b.published_at || "").localeCompare(a.published_at || "")),
    [news]
  );

  const openCreate = () => {
    setEditingNews(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingNews(item);
    setForm({
      title: item.title,
      slug: item.slug,
      summary: item.summary ?? "",
      content: item.content,
      cover_image: item.cover_image ?? "",
      youtube_url: item.youtube_url ?? "",
      is_featured: item.is_featured,
      competition_id: item.competition_id ?? "",
      category_id: item.category_id ?? "",
      meta_title: item.meta_title ?? "",
      meta_description: item.meta_description ?? "",
      published_at: item.published_at
        ? new Date(item.published_at).toISOString().slice(0, 16)
        : "",
    });
    setIsModalOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.title),
      summary: form.summary || null,
      cover_image: form.cover_image || null,
      youtube_url: form.youtube_url || null,
      competition_id: form.competition_id || null,
      category_id: form.category_id || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
    };

    const res = editingNews
      ? await updateNews(editingNews.id, payload)
      : await createNews(payload);

    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      setIsSubmitting(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["news"] });
    toast.success(editingNews ? "News updated" : "News created");
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const handleDelete = async (newsId: string) => {
    setDeletingNewsId(newsId);
    try {
      const res = await deleteNews(newsId);
      if (res && typeof res === "object" && "error" in res) {
        toast.error(String(res.error));
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success("News deleted");
    } finally {
      setDeletingNewsId(null);
    }
  };

  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">News</h1>
        <Button
          onClick={openCreate}
          className="bg-[#302464] hover:bg-[#22194c] text-white font-evogria"
          disabled={isSubmitting || deletingNewsId !== null}
        >
          Add News
        </Button>
      </div>
      {isNewsLoading ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9] p-8 text-center text-sm text-[#667085]">
          Loading news...
        </div>
      ) : null}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Competition</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedNews.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.competition?.title || "-"}</TableCell>
                <TableCell>{item.category?.name || "-"}</TableCell>
                <TableCell>{item.published_at ? new Date(item.published_at).toLocaleString() : "-"}</TableCell>
                <TableCell>{item.is_featured ? "Yes" : "No"}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => openEdit(item)}
                    disabled={isSubmitting || deletingNewsId !== null}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                    disabled={isSubmitting || deletingNewsId !== null}
                    isLoading={deletingNewsId === item.id}
                    loadingText="Deleting..."
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNews ? "Edit News" : "Create News"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm">Title</label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Published At</label>
              <Input type="datetime-local" value={form.published_at} onChange={(e) => setForm((p) => ({ ...p, published_at: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Competition</label>
              <select
                className="w-full border rounded-md p-2"
                value={form.competition_id}
                onChange={(e) => setForm((p) => ({ ...p, competition_id: e.target.value }))}
                disabled={isCompetitionsLoading || isSubmitting}
              >
                <option value="">None</option>
                {competitions.map((c: { id: string; title: string }) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Category</label>
              <select
                className="w-full border rounded-md p-2"
                value={form.category_id}
                onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                disabled={isCategoriesLoading || isSubmitting}
              >
                <option value="">None</option>
                {categories.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Cover Image URL</label>
              <Input value={form.cover_image} onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Youtube URL</label>
              <Input value={form.youtube_url} onChange={(e) => setForm((p) => ({ ...p, youtube_url: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Summary</label>
              <Textarea value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Content</label>
              <Textarea rows={8} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Meta Title</label>
              <Input value={form.meta_title} onChange={(e) => setForm((p) => ({ ...p, meta_title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Meta Description</label>
              <Input value={form.meta_description} onChange={(e) => setForm((p) => ({ ...p, meta_description: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} />
              <span>Featured</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
