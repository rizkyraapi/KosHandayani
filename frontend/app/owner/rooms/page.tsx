'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  DoorOpen,
  Eye,
  Home,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import {
  BranchScopeControl,
  EmptyPanel,
  ErrorPanel,
  LifecyclePill,
  LoadingPanel,
  MetricCard,
  OwnerButton,
  OwnerCard,
  OwnerInput,
  OwnerPage,
  OwnerPageHeader,
  OwnerSelect,
  SectionHeader,
  StatusPill,
} from '@/components/owner/OwnerUi';
import { deleteRoom, getOwnerRoomsOverview, type OwnerRoomOverview } from '@/lib/api';
import { getAuthErrorMessage } from '@/lib/auth';
import { useAutoRefresh } from '@/lib/use-auto-refresh';
import { useOwnerBranchScope } from '@/lib/use-owner-branch-scope';

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-';
}

function DeleteRoomDialog({
  room,
  deleting,
  onCancel,
  onConfirm,
}: {
  room: OwnerRoomOverview | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/45 px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl border border-white bg-white p-6 shadow-[0_24px_70px_rgba(17,28,45,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <AlertTriangle size={24} />
          </span>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f3ff] text-[#3d4a3d] transition hover:bg-[#e7eeff] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Tutup dialog hapus kamar"
          >
            <X size={18} />
          </button>
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-[#111c2d]">
          Hapus {room.room_name}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#3d4a3d]">
          Kamar tanpa riwayat sewa akan dihapus dari daftar beserta foto yang tersimpan. Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="mt-5 rounded-2xl bg-[#f9f9ff] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#006e2f]">
            Validasi sebelum hapus
          </p>
          <p className="mt-1 text-sm font-semibold text-[#111c2d]">
            Jika kamar sudah memiliki occupancy atau riwayat pengajuan, backend akan menolak penghapusan dan sarankan ubah status menjadi maintenance.
          </p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <OwnerButton onClick={onCancel} variant="secondary" disabled={deleting}>
            Batal
          </OwnerButton>
          <OwnerButton onClick={onConfirm} variant="danger" disabled={deleting}>
            {deleting ? <Loader2 className="animate-spin" size={17} /> : <Trash2 size={17} />}
            {deleting ? 'Menghapus...' : 'Ya, hapus kamar'}
          </OwnerButton>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [rooms, setRooms] = useState<OwnerRoomOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [roomPendingDelete, setRoomPendingDelete] = useState<OwnerRoomOverview | null>(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);
  const { branches, branchScope, setBranchScope, branchesLoading } = useOwnerBranchScope();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setRooms(await getOwnerRoomsOverview(branchScope));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat monitoring kamar.');
    } finally {
      setLoading(false);
    }
  }, [branchScope]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  useAutoRefresh(load);

  const openDeleteDialog = useCallback((room: OwnerRoomOverview) => {
    setDeleteMessage('');

    if (room.occupancy) {
      setDeleteError(`Kamar ${room.room_name} masih memiliki occupancy aktif. Akhiri masa sewa atau ubah status kamar menjadi maintenance, bukan menghapus data kamar.`);
      setRoomPendingDelete(null);
      return;
    }

    setDeleteError('');
    setRoomPendingDelete(room);
  }, []);

  const confirmDeleteRoom = useCallback(async () => {
    if (!roomPendingDelete) return;

    try {
      setDeletingRoomId(roomPendingDelete.id);
      setDeleteError('');
      await deleteRoom(roomPendingDelete.id);
      setRooms((current) => current.filter((room) => room.id !== roomPendingDelete.id));
      setDeleteMessage(`Kamar ${roomPendingDelete.room_name} berhasil dihapus.`);
      setRoomPendingDelete(null);
      void load();
    } catch (deleteFailure) {
      setDeleteError(getAuthErrorMessage(deleteFailure, 'Kamar gagal dihapus. Pastikan kamar tidak memiliki occupancy atau riwayat sewa.'));
    } finally {
      setDeletingRoomId(null);
    }
  }, [load, roomPendingDelete]);

  const summary = useMemo(() => ({
    total: rooms.length,
    occupied: rooms.filter((room) => Boolean(room.occupancy)).length,
    vacant: rooms.filter((room) => room.room_status === 'available' && !room.occupancy).length,
    maintenance: rooms.filter((room) => room.room_status === 'maintenance').length,
  }), [rooms]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return rooms.filter((room) => {
      const matchesSearch = !keyword || [
        room.room_name,
        room.branch?.branch_name,
        room.occupancy?.tenant?.full_name,
      ].filter(Boolean).join(' ').toLowerCase().includes(keyword);
      const lifecycle = room.occupancy?.lifecycle_status;
      const matchesStatus = status === 'all'
        || (status === 'occupied' && Boolean(room.occupancy))
        || (status === 'vacant' && room.room_status === 'available' && !room.occupancy)
        || (status === 'maintenance' && room.room_status === 'maintenance')
        || lifecycle === status;

      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, status]);

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Inventory & Occupancy"
        title="Data Kamar"
        description="Pantau unit, tenant aktif, akhir sewa, occupancy status, dan renewal status dalam satu tampilan."
        actions={(
          <>
            <OwnerButton onClick={() => void load()} variant="secondary">
              <RefreshCw size={17} />
              Segarkan
            </OwnerButton>
            <OwnerButton href="/owner/rooms/create">
              <Plus size={17} />
              Tambah kamar
            </OwnerButton>
          </>
        )}
      />

      <BranchScopeControl
        branches={branches}
        value={branchScope}
        onChange={setBranchScope}
        disabled={loading || branchesLoading}
        className="mb-8"
      />

      {(deleteError || deleteMessage) && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            deleteError
              ? 'border-red-100 bg-red-50 text-red-800'
              : 'border-green-100 bg-green-50 text-green-800'
          }`}
        >
          <div className="flex items-start gap-3">
            {deleteError ? <AlertTriangle className="mt-0.5 shrink-0" size={18} /> : <Trash2 className="mt-0.5 shrink-0" size={18} />}
            <p className="leading-6">{deleteError || deleteMessage}</p>
          </div>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Unit" value={summary.total} icon={BedDouble} tone="blue" />
        <MetricCard label="Unit Terisi" value={summary.occupied} icon={Home} tone="green" />
        <MetricCard label="Unit Kosong" value={summary.vacant} icon={DoorOpen} tone="amber" />
        <MetricCard label="Maintenance" value={summary.maintenance} icon={Wrench} tone="red" />
      </div>

      <OwnerCard>
        <SectionHeader
          title="Monitoring Unit"
          description={`${filtered.length} dari ${rooms.length} unit ditampilkan.`}
          action={(
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 text-[#6d7b6c]" size={17} />
                <OwnerInput value={search} onChange={setSearch} placeholder="Cari kamar atau tenant..." className="w-full pl-10 sm:w-64" />
              </div>
              <OwnerSelect value={status} onChange={setStatus} ariaLabel="Filter status kamar">
                <option value="all">Semua status</option>
                <option value="occupied">Terisi</option>
                <option value="vacant">Kosong</option>
                <option value="maintenance">Maintenance</option>
                <option value="h30">H-30</option>
                <option value="h7">H-7</option>
                <option value="h1">H-1</option>
                <option value="overdue">Overdue</option>
              </OwnerSelect>
            </div>
          )}
        />

        {loading && rooms.length === 0 ? (
          <LoadingPanel />
        ) : error && rooms.length === 0 ? (
          <ErrorPanel message={error} onRetry={() => void load()} />
        ) : filtered.length === 0 ? (
          <EmptyPanel title="Kamar tidak ditemukan" description="Ubah kata kunci atau filter status untuk melihat unit lainnya." />
        ) : (
          <div className="grid gap-4">
            {filtered.map((room) => {
              const occupancy = room.occupancy;

              return (
                <article key={room.id} className="overflow-hidden rounded-2xl border border-[#e7eeff] bg-[#f9f9ff]">
                  <div className="grid lg:grid-cols-[180px_minmax(0,1fr)_240px]">
                    <div className="relative min-h-44 bg-[#e7eeff]">
                      {room.thumbnail ? (
                        <Image src={room.thumbnail} alt={room.room_name} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="flex h-full min-h-44 items-center justify-center text-[#006e2f]"><BedDouble size={36} /></div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#006e2f]">
                            {room.branch?.branch_name || 'Cabang belum diatur'}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold text-[#111c2d]">{room.room_name}</h3>
                          <p className="mt-1 text-base font-semibold text-[#3d4a3d]">{rupiah(room.price)} / bulan</p>
                        </div>
                        <StatusPill
                          label={room.room_status === 'maintenance' ? 'Maintenance' : occupancy ? 'Terisi' : 'Kosong'}
                          tone={room.room_status === 'maintenance' ? 'red' : occupancy ? 'green' : 'amber'}
                        />
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-sm text-[#3d4a3d]">Tenant aktif</p>
                          <p className="mt-1 text-base font-semibold">{occupancy?.tenant?.full_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#3d4a3d]">Akhir sewa</p>
                          <p className="mt-1 text-base font-semibold">{date(occupancy?.end_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#3d4a3d]">Occupancy</p>
                          <div className="mt-1"><LifecyclePill status={occupancy?.lifecycle_status} label={occupancy?.lifecycle_label || 'Kosong'} /></div>
                        </div>
                        <div>
                          <p className="text-sm text-[#3d4a3d]">Renewal</p>
                          <div className="mt-1">
                            <StatusPill
                              label={occupancy?.renewal_status.label || 'Belum Ada'}
                              tone={occupancy?.renewal_status.key === 'successful' ? 'green' : occupancy?.renewal_status.key === 'failed' ? 'red' : occupancy?.renewal_status.key === 'pending' ? 'amber' : 'slate'}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3 border-t border-[#e7eeff] p-5 lg:border-l lg:border-t-0">
                      <OwnerButton href={`/room/${room.id}`} variant="secondary">
                        <Eye size={17} />
                        Detail kamar
                      </OwnerButton>
                      <OwnerButton href={`/owner/rooms/create?edit=${room.id}`} variant="secondary">
                        <Pencil size={17} />
                        Edit
                      </OwnerButton>
                      <OwnerButton
                        onClick={() => openDeleteDialog(room)}
                        variant="danger"
                        disabled={deletingRoomId === room.id}
                      >
                        {deletingRoomId === room.id ? <Loader2 className="animate-spin" size={17} /> : <Trash2 size={17} />}
                        Hapus
                      </OwnerButton>
                      {occupancy ? (
                        <OwnerButton href={`/owner/tenants/${occupancy.rental_application_id}`}>
                          <UserRound size={17} />
                          Lihat tenant
                        </OwnerButton>
                      ) : (
                        <OwnerButton href="/owner/rental-applications" variant="ghost">
                          <CalendarDays size={17} />
                          Lihat pengajuan
                        </OwnerButton>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </OwnerCard>

      <DeleteRoomDialog
        room={roomPendingDelete}
        deleting={deletingRoomId === roomPendingDelete?.id}
        onCancel={() => setRoomPendingDelete(null)}
        onConfirm={() => void confirmDeleteRoom()}
      />
    </OwnerPage>
  );
}
