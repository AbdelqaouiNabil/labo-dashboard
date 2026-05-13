"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Search, Pencil, Trash2, Download, ChevronLeft, ChevronRight,
  X, ChevronsUpDown, ChevronUp, ChevronDown,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Analysis } from "@/lib/supabase/types";

const PAGE_SIZE = 20;

// ── Prix preview (mirrors Supabase generated column formula) ─────────────────
function computePrix(coeffB: number): number {
  return Math.floor(((coeffB * 1.1) + 20) / 10) * 10;
}

// ── Tag input ────────────────────────────────────────────────────────────────
function TagInput({
  tags,
  onChange,
  placeholder = "Ajouter (Entrée ou virgule)…",
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 min-h-[38px] w-full rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 rounded-full px-2 py-0.5 text-xs border border-slate-200"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((_, j) => j !== i))}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[140px] text-sm bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

// ── Sort helper ───────────────────────────────────────────────────────────────
type SortField = "code" | "nom" | "categorie" | "coefficient_b" | "prix";
type SortDir = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 text-slate-400" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 ml-1 text-slate-700" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1 text-slate-700" />;
}

// ── Analysis modal (create + edit) ───────────────────────────────────────────
type AnalysisForm = {
  code: string;
  nom: string;
  categorie: string;
  sous_categorie: string;
  coefficient_b: string;
  synonymes: string[];
};

function emptyForm(): AnalysisForm {
  return { code: "", nom: "", categorie: "", sous_categorie: "", coefficient_b: "", synonymes: [] };
}

function toForm(a: Analysis): AnalysisForm {
  return {
    code: a.code,
    nom: a.nom,
    categorie: a.categorie ?? "",
    sous_categorie: a.sous_categorie ?? "",
    coefficient_b: String(a.coefficient_b),
    synonymes: a.synonymes ?? [],
  };
}

function AnalysisModal({
  target,
  onClose,
  onSaved,
}: {
  target: Analysis | null; // null = create
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = target !== null;
  const [form, setForm] = useState<AnalysisForm>(target ? toForm(target) : emptyForm());
  const [saving, setSaving] = useState(false);

  const set = (field: keyof AnalysisForm, value: string | string[]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const coeffNum = parseInt(form.coefficient_b, 10);
  const prixPreview = !isNaN(coeffNum) && coeffNum > 0 ? computePrix(coeffNum) : null;

  const handleSave = async () => {
    if (!form.nom.trim()) {
      toast({ title: "Erreur", description: "Le nom est obligatoire.", variant: "destructive" });
      return;
    }
    if (!form.coefficient_b || isNaN(parseInt(form.coefficient_b, 10))) {
      toast({ title: "Erreur", description: "Le coefficient B doit être un nombre.", variant: "destructive" });
      return;
    }
    if (!isEdit && !form.code.trim()) {
      toast({ title: "Erreur", description: "Le code est obligatoire.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const payload = {
      nom: form.nom.trim(),
      categorie: form.categorie.trim() || null,
      sous_categorie: form.sous_categorie.trim() || null,
      coefficient_b: parseInt(form.coefficient_b, 10),
      synonymes: form.synonymes,
      ...(isEdit ? {} : { code: form.code.trim() }),
    };

    const res = await fetch(
      isEdit ? `/api/analyses?id=${target!.id}` : "/api/analyses",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erreur inconnue" }));
      const msg = (err.error ?? "").includes("unique") ? "Ce code existe déjà." : (err.error ?? "Erreur serveur");
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "Analyse mise à jour" : "Analyse créée" });
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'analyse" : "Nouvelle analyse"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Code *</label>
            <Input
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder="Ex: NFS"
              readOnly={isEdit}
              className={isEdit ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Coefficient B *</label>
            <Input
              value={form.coefficient_b}
              onChange={(e) => set("coefficient_b", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Ex: 120"
              type="number"
              min="1"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">Nom *</label>
            <Input
              value={form.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="Ex: Numération Formule Sanguine"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Catégorie</label>
            <Input
              value={form.categorie}
              onChange={(e) => set("categorie", e.target.value)}
              placeholder="Ex: Hématologie"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Sous-catégorie</label>
            <Input
              value={form.sous_categorie}
              onChange={(e) => set("sous_categorie", e.target.value)}
              placeholder="Ex: Bilan complet"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">Synonymes</label>
            <TagInput tags={form.synonymes} onChange={(v) => set("synonymes", v)} />
          </div>

          {prixPreview !== null && (
            <div className="col-span-2 flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
              <span className="text-xs text-[#8B1F1F]">Prix calculé automatiquement :</span>
              <span className="font-semibold text-[#8B1F1F]">{prixPreview} MAD</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#8B1F1F] hover:bg-[#7A1818]">
            {saving ? "Sauvegarde…" : isEdit ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete confirmation ───────────────────────────────────────────────────────
function DeleteDialog({
  target,
  onClose,
  onDeleted,
}: {
  target: Analysis;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/analyses?id=${target.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erreur inconnue" }));
      toast({ title: "Erreur", description: err.error ?? "Erreur serveur", variant: "destructive" });
    } else {
      toast({ title: "Analyse supprimée" });
      onDeleted();
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;analyse</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 py-2">
          Êtes-vous sûr de vouloir supprimer <span className="font-medium">{target.nom}</span>{" "}
          <span className="text-slate-400">({target.code})</span> ? Cette action est irréversible.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCSV(data: Analysis[]) {
  const headers = ["Code", "Nom", "Catégorie", "Sous-catégorie", "Coefficient B", "Prix (MAD)", "Synonymes"];
  const rows = data.map((a) => [
    a.code,
    a.nom,
    a.categorie ?? "",
    a.sous_categorie ?? "",
    a.coefficient_b,
    a.prix ?? "",
    (a.synonymes ?? []).join("; "),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analyses_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main table ────────────────────────────────────────────────────────────────
export function AnalysesTable() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("code");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [modalTarget, setModalTarget] = useState<Analysis | null | "create">(null);
  const [deleteTarget, setDeleteTarget] = useState<Analysis | null>(null);

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/analyses");
    if (!res.ok) {
      toast({ title: "Erreur", description: "Impossible de charger les analyses.", variant: "destructive" });
    } else {
      const data = await res.json();
      setAnalyses((data as Analysis[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnalyses(); }, [fetchAnalyses]);

  // Reset page on filter/search change
  useEffect(() => { setPage(0); }, [search, categoryFilter]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = Array.from(new Set(analyses.map((a) => a.categorie).filter(Boolean))) as string[];
    return cats.sort();
  }, [analyses]);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = analyses;

    if (q) {
      result = result.filter((a) =>
        a.code.toLowerCase().includes(q) ||
        a.nom.toLowerCase().includes(q) ||
        (a.synonymes ?? []).some((s) => s.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((a) => a.categorie === categoryFilter);
    }

    result = [...result].sort((a, b) => {
      let va: string | number = a[sortField] ?? "";
      let vb: string | number = b[sortField] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [analyses, search, categoryFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const thClass = "cursor-pointer select-none hover:bg-slate-100 transition-colors";

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher code, nom, synonyme…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button
            size="sm"
            className="bg-[#8B1F1F] hover:bg-[#7A1818]"
            onClick={() => setModalTarget("create")}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nouvelle analyse
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <p className="text-sm text-slate-500">
        {loading ? "Chargement…" : `${filtered.length} analyse${filtered.length > 1 ? "s" : ""} trouvée${filtered.length > 1 ? "s" : ""}`}
      </p>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className={thClass} onClick={() => toggleSort("code")}>
                <span className="flex items-center">Code <SortIcon field="code" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className={thClass} onClick={() => toggleSort("nom")}>
                <span className="flex items-center">Nom <SortIcon field="nom" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className={thClass} onClick={() => toggleSort("categorie")}>
                <span className="flex items-center">Catégorie <SortIcon field="categorie" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead>Sous-catégorie</TableHead>
              <TableHead className={thClass} onClick={() => toggleSort("coefficient_b")}>
                <span className="flex items-center">Coeff. B <SortIcon field="coefficient_b" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className={thClass} onClick={() => toggleSort("prix")}>
                <span className="flex items-center">Prix <SortIcon field="prix" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead>Synonymes</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-400 py-12">
                  {search || categoryFilter !== "all" ? "Aucun résultat pour cette recherche." : "Aucune analyse enregistrée."}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((a) => (
                <TableRow key={a.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-sm font-medium text-slate-700">{a.code}</TableCell>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate" title={a.nom}>{a.nom}</div>
                  </TableCell>
                  <TableCell>
                    {a.categorie ? (
                      <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] text-blue-700">
                        {a.categorie}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{a.sous_categorie ?? "—"}</TableCell>
                  <TableCell className="text-center font-medium">{a.coefficient_b}</TableCell>
                  <TableCell className="font-semibold text-[#8B1F1F]">
                    {a.prix != null ? `${a.prix} MAD` : "—"}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {(a.synonymes ?? []).slice(0, 3).map((s, i) => (
                        <span key={i} className="inline-block rounded-full bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
                          {s}
                        </span>
                      ))}
                      {(a.synonymes ?? []).length > 3 && (
                        <span className="text-[10px] text-slate-400">+{(a.synonymes ?? []).length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-slate-900"
                        onClick={() => setModalTarget(a)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page + 1} sur {totalPages} · {filtered.length} résultats
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const p = page < 3 ? i : page - 2 + i;
              if (p >= totalPages) return null;
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={p === page ? "bg-[#8B1F1F] hover:bg-[#7A1818] w-8 h-8 p-0" : "w-8 h-8 p-0"}
                  onClick={() => setPage(p)}
                >
                  {p + 1}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalTarget !== null && (
        <AnalysisModal
          target={modalTarget === "create" ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onSaved={fetchAnalyses}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={fetchAnalyses}
        />
      )}
    </>
  );
}
