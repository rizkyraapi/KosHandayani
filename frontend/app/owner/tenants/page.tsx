'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  CreditCard,
  Eye,
  RefreshCw,
  RotateCw,
  Search,
  UsersRound,
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
import { getOwnerTenants, type OwnerTenantOccupancy } from '@/lib/api';
import { useAutoRefresh } from '@/lib/use-auto-refresh';
import { useOwnerBranchScope } from '@/lib/use-owner-branch-scope';

function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-';
}

function remainingLabel(value?: number | null) {
  if (value === null || typeof value === 'undefined') return '-';
  if (value < 0) return `${Math.abs(value)} hari terlambat`;
  if (value === 0) return 'Berakhir hari ini';
  return `${value} hari`;
}

export default function Page() {
  const [tenants, setTenants] = useState<OwnerTenantOccupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(() => (
    typeof window === 'undefined' ? 'all' : new URLSearchParams(window.location.search).get('status') || 'all'
  ));
  const { branches, branchScope, setBranchScope, branchesLoading } = useOwnerBranchScope();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setTenants(await getOwnerTenants(branchScope));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat lifecycle tenant.');
    } finally {
      setLoading(false);
    }
  }, [branchScope]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  useAutoRefresh(load);

  const counts = useMemo(() => ({
    active: tenants.length,
    h30: tenants.filter((item) => item.lifecycle_status === 'h30').length,
    h7: tenants.filter((item) => item.lifecycle_status === 'h7').length,
    critical: tenants.filter((item) => ['h1', 'overdue'].includes(item.lifecycle_status)).length,
  }), [tenants]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return tenants.filter((item) => {
      const matchesSearch = !keyword || [
        item.tenant?.full_name,
        item.tenant?.email,
        item.room?.room_name,
        item.room?.branch?.branch_name,
      ].filter(Boolean).join(' ').toLowerCase().includes(keyword);
      const matchesStatus = status === 'all' || item.lifecycle_status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, tenants]);

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Tenant Lifecycle"
        title="Penyewa Aktif"
        description="Monitoring masa sewa, sisa hari, reminder, serta status perpanjangan seluruh tenant aktif."
        actions={<OwnerButton onClick={() => void load()}><RefreshCw size={17} />Segarkan</OwnerButton>}
      />

      <BranchScopeControl
        branches={branches}
        value={branchScope}
        onChange={setBranchScope}
        disabled={loading || branchesLoading}
        className="mb-8"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tenant Aktif" value={counts.active} icon={UsersRound} tone="green" />
        <MetricCard label="H-30" value={counts.h30} icon={Clock3} tone="amber" />
        <MetricCard label="H-7" value={counts.h7} icon={AlertTriangle} tone="orange" />
        <MetricCard label="Kritis / Overdue" value={counts.critical} icon={CalendarDays} tone="red" />
      </div>

      <OwnerCard>
        <SectionHeader
          title="Tenant Lifecycle Monitoring"
          description={`${filtered.length} tenant ditampilkan berdasarkan occupancy aktif.`}
          action={(
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 text-[#6d7b6c]" size={17} />
                <OwnerInput value={search} onChange={setSearch} placeholder="Cari tenant atau kamar..." className="w-full pl-10 sm:w-64" />
              </div>
              <OwnerSelect value={status} onChange={setStatus} ariaLabel="Filter lifecycle tenant">
                <option value="all">Semua lifecycle</option>
                <option value="active">Aktif</option>
                <option value="h30">H-30</option>
                <option value="h7">H-7</option>
                <option value="h1">H-1</option>
                <option value="overdue">Overdue</option>
              </OwnerSelect>
            </div>
          )}
        />

        {loading && tenants.length === 0 ? (
          <LoadingPanel />
        ) : error && tenants.length === 0 ? (
          <ErrorPanel message={error} onRetry={() => void load()} />
        ) : filtered.length === 0 ? (
          <EmptyPanel title="Tenant tidak ditemukan" description="Ubah pencarian atau filter lifecycle." />
        ) : (
          <div className="grid gap-4">
            {filtered.map((item) => (
              <article key={item.id} className="rounded-2xl border border-[#e7eeff] bg-[#f9f9ff] p-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_250px] xl:items-center">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <LifecyclePill status={item.lifecycle_status} label={item.lifecycle_label} />
                      <StatusPill
                        label={`Renewal ${item.renewal_status.label}`}
                        tone={item.renewal_status.key === 'successful' ? 'green' : item.renewal_status.key === 'failed' ? 'red' : item.renewal_status.key === 'pending' ? 'amber' : 'slate'}
                      />
                    </div>
                    <h3 className="text-2xl font-semibold">{item.tenant?.full_name || item.tenant?.email || 'Penyewa'}</h3>
                    <p className="mt-1 text-base text-[#3d4a3d]">{item.room?.room_name || '-'} · {item.room?.branch?.branch_name || '-'}</p>
                    <p className="mt-2 text-sm text-[#3d4a3d]">{item.tenant?.whatsapp || 'WhatsApp belum tersedia'} · {item.tenant?.pekerjaan || 'Pekerjaan belum tersedia'}</p>
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-[#3d4a3d]">Mulai sewa</p><p className="mt-1 text-base font-semibold">{date(item.start_date)}</p></div>
                      <div><p className="text-[#3d4a3d]">Akhir sewa</p><p className="mt-1 text-base font-semibold">{date(item.end_date)}</p></div>
                      <div><p className="text-[#3d4a3d]">Sisa hari</p><p className="mt-1 text-base font-semibold">{remainingLabel(item.days_remaining)}</p></div>
                      <div><p className="text-[#3d4a3d]">Reminder terakhir</p><p className="mt-1 text-base font-semibold">{item.latest_reminder?.reminder_type || '-'}</p></div>
                    </div>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm font-semibold">
                        <span>Progress masa sewa</span>
                        <span className="text-[#006e2f]">{item.lease_progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#e7eeff]">
                        <div className={`h-full rounded-full ${item.lifecycle_status === 'overdue' ? 'bg-red-800' : 'bg-[#006e2f]'}`} style={{ width: `${item.lease_progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <OwnerButton href={`/owner/tenants/${item.rental_application_id}`}>
                      <Eye size={17} /> Detail tenant
                    </OwnerButton>
                    <OwnerButton href={`/owner/payments?tenant=${item.user_id}`} variant="secondary">
                      <CreditCard size={17} /> Histori pembayaran
                    </OwnerButton>
                    <OwnerButton href={`/owner/payments?tenant=${item.user_id}&category=renewal`} variant="ghost">
                      <RotateCw size={17} /> Histori renewal
                    </OwnerButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </OwnerCard>
    </OwnerPage>
  );
}
