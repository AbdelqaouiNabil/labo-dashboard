"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { toast } from "@/hooks/use-toast";
import { AppointmentWithContact } from "@/lib/supabase/types";
import { formatPhone } from "@/lib/utils";

const PAGE_SIZE = 10;

function formatAppointmentDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr; // show raw string if unparseable
  return format(d, "d MMM yyyy", { locale: fr });
}

const typeLabel: Record<string, string> = {
  home_kenitra: "🏠 Domicile Kénitra",
  home_outside: "🚗 Domicile Hors ville",
  onsite: "🏥 Sur place",
};

type EditForm = {
  patient_name: string;
  phone: string;
  adresse: string;
  reservation_type: string;
  service: string;
  appointment_date: string;
  notes: string;
  total_price: string;
  travel_fee: string;
  final_price: string;
  status: string;
};

function toEditForm(apt: AppointmentWithContact): EditForm {
  return {
    patient_name: apt.patient_name ?? "",
    phone: apt.phone != null ? String(apt.phone) : "",
    adresse: apt.adresse ?? "",
    reservation_type: apt.reservation_type ?? "onsite",
    service: apt.service ?? "",
    appointment_date: apt.appointment_date ?? "",
    notes: apt.notes ?? "",
    total_price: apt.total_price != null ? String(apt.total_price) : "",
    travel_fee: apt.travel_fee != null ? String(apt.travel_fee) : "",
    final_price: apt.final_price != null ? String(apt.final_price) : "",
    status: apt.status ?? "pending",
  };
}

function EditDialog({
  apt,
  onClose,
  onSaved,
}: {
  apt: AppointmentWithContact;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<EditForm>(() => toEditForm(apt));
  const [saving, setSaving] = useState(false);

  const set = (field: keyof EditForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: apt.id,
        patient_name: form.patient_name || null,
        phone: form.phone ? Number(form.phone) : null,
        adresse: form.adresse || null,
        reservation_type: form.reservation_type,
        service: form.service || null,
        appointment_date: form.appointment_date || null,
        notes: form.notes || null,
        total_price: form.total_price ? Number(form.total_price) : null,
        travel_fee: form.travel_fee ? Number(form.travel_fee) : null,
        final_price: form.final_price ? Number(form.final_price) : null,
        status: form.status,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } else {
      toast({ title: "Rendez-vous mis à jour" });
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le rendez-vous</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">Nom du patient</label>
            <Input value={form.patient_name} onChange={(e) => set("patient_name", e.target.value)} placeholder="Nom du patient" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Téléphone</label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="06XXXXXXXX" type="tel" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Statut</label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">Adresse</label>
            <Input value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="Adresse" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Type de réservation</label>
            <Select value={form.reservation_type} onValueChange={(v) => set("reservation_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="home_kenitra">🏠 Domicile Kénitra</SelectItem>
                <SelectItem value="home_outside">🚗 Domicile Hors ville</SelectItem>
                <SelectItem value="onsite">🏥 Sur place</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Date du rendez-vous</label>
            <Input value={form.appointment_date} onChange={(e) => set("appointment_date", e.target.value)} placeholder="YYYY-MM-DD" />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">Service / Analyses</label>
            <Input value={form.service} onChange={(e) => set("service", e.target.value)} placeholder="Ex: NFS, Glycémie…" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Prix total (MAD)</label>
            <Input value={form.total_price} onChange={(e) => set("total_price", e.target.value)} type="number" min="0" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Frais déplacement (MAD)</label>
            <Input value={form.travel_fee} onChange={(e) => set("travel_fee", e.target.value)} type="number" min="0" />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">Prix final (MAD)</label>
            <Input value={form.final_price} onChange={(e) => set("final_price", e.target.value)} type="number" min="0" />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Notes internes…"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  apt,
  onClose,
  onDeleted,
}: {
  apt: AppointmentWithContact;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch("/api/appointments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: apt.id }),
    });
    setDeleting(false);
    if (!res.ok) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    } else {
      toast({ title: "Rendez-vous supprimé" });
      onDeleted();
      onClose();
    }
  };

  const name = apt.patient_name ?? apt.contacts?.name ?? "ce rendez-vous";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer le rendez-vous</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 py-2">
          Êtes-vous sûr de vouloir supprimer le rendez-vous de <span className="font-medium">{name}</span> ? Cette action est irréversible.
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

export function AppointmentTable() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [appointments, setAppointments] = useState<AppointmentWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [editTarget, setEditTarget] = useState<AppointmentWithContact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentWithContact | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), status: statusFilter });
    const res = await fetch(`/api/appointments?${params}`);
    const { data, count } = await res.json();
    setAppointments(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => { setPage(0); }, [statusFilter]);
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <div>
        <div className="mb-4">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <TabsList>
              <TabsTrigger value="all">Tous ({total})</TabsTrigger>
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmé</TabsTrigger>
              <TabsTrigger value="cancelled">Annulé</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Patient</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Analyses</TableHead>
                <TableHead>Prix Final</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                    Aucun rendez-vous
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">
                      <div>{apt.patient_name ?? apt.contacts?.name ?? "Inconnu"}</div>
                      {apt.patient_name && apt.contacts?.name && apt.patient_name !== apt.contacts.name && (
                        <div className="text-xs text-slate-400">{apt.contacts.name}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {apt.phone
                        ? formatPhone(String(apt.phone))
                        : formatPhone(apt.contacts?.phone ?? "")}
                    </TableCell>
                    <TableCell>
                      <div>{typeLabel[apt.reservation_type] ?? apt.reservation_type}</div>
                      {apt.adresse && (
                        <div className="text-xs text-slate-400 max-w-[160px] truncate" title={apt.adresse}>{apt.adresse}</div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      {apt.service ? (
                        <div className="flex flex-wrap gap-1">
                          {apt.service.split(/[,،;]+/).map((s) => s.trim()).filter(Boolean).map((s, i) => (
                            <span key={i} className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 border border-slate-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="font-medium">{apt.final_price} MAD</TableCell>
                    <TableCell>
                      {formatAppointmentDate(apt.appointment_date)}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-slate-500 text-xs" title={apt.notes ?? ""}>
                      {apt.notes ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={apt.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-slate-900"
                          onClick={() => setEditTarget(apt)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-red-600"
                          onClick={() => setDeleteTarget(apt)}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Page {page + 1} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {editTarget && (
        <EditDialog
          apt={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={fetchAppointments}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          apt={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={fetchAppointments}
        />
      )}
    </>
  );
}
