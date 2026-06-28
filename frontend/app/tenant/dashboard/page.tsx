'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import RentalApplicationStatusBadge from '@/components/RentalApplicationStatusBadge';
import RoomCard from '@/components/RoomCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/UiState';
import {
  getMyPayments,
  getMyRentalApplications,
  getRooms,
  type ApiRoom,
  type Payment,
  type RentalApplication,
} from '@/lib/api';
import type { Locale } from '@/lib/i18n';
import { getPaymentMetaFromPayment } from '@/lib/paymentStatus';
import { getDurationInMonths, getRentalPaymentBreakdown } from '@/lib/rental-payment';

/* ═══════════════════════════════════════════════════════════════
   ALL CUSTOM STYLES — fonts, colors, utilities, Material Symbols,
   glass-effect, animations — injected into <head> at runtime.
   Nothing outside this file needs changing.
═══════════════════════════════════════════════════════════════ */
const CUSTOM_STYLES = `

/* ── Base ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }
html { font-family: var(--font-manrope), Manrope, sans-serif; }
body { font-family: var(--font-manrope), Manrope, sans-serif; }
.font-manrope { font-family: var(--font-manrope), Manrope, sans-serif !important; }
.font-inter    { font-family: var(--font-manrope), Manrope, sans-serif !important; }

/* ── Material Symbols ─────────────────────────────── */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* ── Glass effect ─────────────────────────────────── */
.glass-effect {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* ════════════════════════════════════════════════════
   BACKGROUND COLORS
════════════════════════════════════════════════════ */
.bg-background               { background-color: #f9f9ff; }
.bg-surface                  { background-color: #f9f9ff; }
.bg-surface-bright           { background-color: #f9f9ff; }
.bg-surface-dim              { background-color: #cfdaf2; }
.bg-surface-variant          { background-color: #d8e3fb; }
.bg-surface-container-lowest { background-color: #ffffff; }
.bg-surface-container-low    { background-color: #f0f3ff; }
.bg-surface-container        { background-color: #e7eeff; }
.bg-surface-container-high   { background-color: #dee8ff; }
.bg-surface-container-highest{ background-color: #d8e3fb; }
.bg-inverse-surface          { background-color: #263143; }

/* with alpha */
.bg-surface-container-low-50 { background-color: rgba(240,243,255,0.5); }

/* Primary */
.bg-primary                  { background-color: #006e2f; }
.bg-primary-container        { background-color: #22c55e; }
.bg-primary-fixed            { background-color: #6bff8f; }
.bg-primary-fixed-dim        { background-color: #4ae176; }
.bg-primary-container-20     { background-color: rgba(34,197,94,0.2); }

/* Secondary */
.bg-secondary                { background-color: #2f6a3c; }
.bg-secondary-container      { background-color: #afefb4; }
.bg-secondary-fixed          { background-color: #b2f2b7; }
.bg-secondary-container-30   { background-color: rgba(175,239,180,0.3); }

/* Tertiary */
.bg-tertiary                 { background-color: #9e4036; }
.bg-tertiary-container       { background-color: #ff8b7c; }
.bg-tertiary-container-20    { background-color: rgba(255,139,124,0.2); }

/* Error */
.bg-error                    { background-color: #ba1a1a; }
.bg-error-container          { background-color: #ffdad6; }
.bg-error-5                  { background-color: rgba(186,26,26,0.05); }

/* ════════════════════════════════════════════════════
   TEXT COLORS
════════════════════════════════════════════════════ */
.text-on-background          { color: #111c2d; }
.text-on-surface             { color: #111c2d; }
.text-on-surface-variant     { color: #3d4a3d; }
.text-on-primary             { color: #ffffff; }
.text-on-primary-container   { color: #004b1e; }
.text-on-primary-fixed       { color: #002109; }
.text-on-secondary           { color: #ffffff; }
.text-on-secondary-container { color: #346e40; }
.text-on-tertiary            { color: #ffffff; }
.text-on-tertiary-container  { color: #76231b; }
.text-on-error               { color: #ffffff; }
.text-on-error-container     { color: #93000a; }
.text-primary                { color: #006e2f; }
.text-secondary              { color: #2f6a3c; }
.text-tertiary               { color: #9e4036; }
.text-error                  { color: #ba1a1a; }
.text-outline                { color: #6d7b6c; }
.text-outline-variant        { color: #bccbb9; }
.text-inverse-primary        { color: #4ae176; }
.text-inverse-on-surface     { color: #ecf1ff; }

/* ════════════════════════════════════════════════════
   BORDER COLORS
════════════════════════════════════════════════════ */
.border-outline              { border-color: #6d7b6c; }
.border-outline-variant      { border-color: #bccbb9; }
.border-outline-variant-20   { border-color: rgba(188,203,185,0.2); }
.border-outline-variant-30   { border-color: rgba(188,203,185,0.3); }
.border-primary              { border-color: #006e2f; }
.border-error                { border-color: #ba1a1a; }
.border-error-10             { border-color: rgba(186,26,26,0.1); }

/* ════════════════════════════════════════════════════
   GRADIENT STOPS (bg-gradient-to-r requires these)
════════════════════════════════════════════════════ */
.from-primary {
  --tw-gradient-from: #006e2f var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(0,110,47,0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.to-primary-container {
  --tw-gradient-to: #22c55e var(--tw-gradient-to-position);
}

/* ════════════════════════════════════════════════════
   HOVER OVERRIDES
════════════════════════════════════════════════════ */
.hover-bg-surface-container:hover      { background-color: #e7eeff; }
.hover-bg-surface-container-high:hover { background-color: #dee8ff; }
.hover-bg-error-5:hover                { background-color: rgba(186,26,26,0.05); }

.hover-shadow-primary-20:hover {
  box-shadow: 0 10px 15px -3px rgba(0,110,47,0.2),
              0 4px  6px  -4px rgba(0,110,47,0.2);
}

/* ════════════════════════════════════════════════════
   DARK MODE (sidebar only)
════════════════════════════════════════════════════ */
.dark .dark-bg-slate-950           { background-color: #020617; }
.dark .dark-bg-green-900-20        { background-color: rgba(20,83,45,0.2); }
.dark .dark-text-green-300         { color: #86efac; }
.dark .dark-text-slate-400         { color: #94a3b8; }
.dark .dark-hover-bg-slate-800:hover { background-color: #1e293b; }

/* ════════════════════════════════════════════════════
   ANIMATIONS
════════════════════════════════════════════════════ */
@keyframes kos-pulse {
  0%,100% { opacity:1; }
  50%      { opacity:.5; }
}
.animate-pulse { animation: kos-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }

/* ════════════════════════════════════════════════════
   RESPONSIVE — mobile sidebar
════════════════════════════════════════════════════ */
.sidebar-drawer {
  transition: transform 0.25s ease;
}
@media (max-width: 1023px) {
  .sidebar-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 40;
  }
  .sidebar-drawer {
    position: fixed !important; left: 0; top: 0; bottom: 0;
    width: 17rem;
    z-index: 50;
  }
  .sidebar-drawer.closed { transform: translateX(-100%); }
  .sidebar-drawer.open   { transform: translateX(0); }
  .main-offset { margin-left: 0 !important; }
}
@media (min-width: 1024px) {
  .sidebar-overlay      { display: none !important; }
  .sidebar-drawer       { transform: translateX(0) !important; }
  .mobile-menu-btn      { display: none !important; }
  .main-offset          { margin-left: 16rem; }
}
`;

/* ─────────────────────────────────────────────
   Static data
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: 'home',           labelKey: 'common.myRoom', href: '/tenant/dashboard', active: true  },
  { icon: 'door_front',     labelKey: 'tenant.billing.myRoom', href: '/rooms', active: false },
  { icon: 'request_quote',  labelKey: 'common.bill', href: '/tenant/tagihan', active: false },
  { icon: 'history',        labelKey: 'common.history', href: '/tenant/riwayat', active: false },
  { icon: 'account_circle', labelKey: 'common.profile', href: '/tenant/profil', active: false },
];

const HOUSE_RULES = [
  'Maks. 2 orang per kamar',
  'Tidak untuk pasutri',
  'Tidak boleh membawa anak',
  'Akses penghuni 24 jam',
  'Tamu mengikuti jam malam',
  'Khusus karyawan',
];

const ROOM_AMENITIES = ['ac_unit', 'wifi', 'shower'];

const QUICK_ACTIONS = [
  {
    icon: 'history',
    bg: 'bg-secondary-container-30',
    color: 'text-secondary',
    title: 'Riwayat',
    desc: 'Lihat transaksi lama',
    href: '/tenant/riwayat',
  },
  {
    icon: 'support_agent',
    bg: 'bg-tertiary-container-20',
    color: 'text-tertiary',
    title: 'Bantuan',
    desc: 'Layanan pengaduan belum tersedia',
    href: null,
  },
  {
    icon: 'qr_code_2',
    bg: 'bg-primary-container-20',
    color: 'text-primary',
    title: 'Akses Gate',
    desc: 'Akses digital belum tersedia',
    href: null,
  },
  {
    icon: 'account_balance_wallet',
    bg: 'bg-slate-200',
    color: 'text-slate-700',
    title: 'Tagihan',
    desc: 'Cek pembayaran',
    href: '/tenant/tagihan',
  },
];

type Announcement = {
  type: 'image' | 'icon';
  src?: string;
  icon?: string;
  badge?: string | null;
  title: string;
  body: string;
};

const ANNOUNCEMENTS: Announcement[] = [];

function formatRupiah(value?: number | null) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatDate(value?: string | null, locale: Locale = 'id') {
  if (!value) return '-';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium' }).format(new Date(value));
}

function getPaymentStatusLabel(payment: Payment | null | undefined, t: (key: string) => string) {
  if (!payment) return t('tenant.billing.noActiveBill');

  return t(getPaymentMetaFromPayment(payment).labelKey);
}

function parseDateOnly(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateFallbackEndDate(application?: RentalApplication | null) {
  const moveInDate = parseDateOnly(application?.move_in_date);

  if (!moveInDate) return null;

  const endDate = new Date(moveInDate);
  endDate.setMonth(endDate.getMonth() + getDurationInMonths(application?.duration));

  return endDate;
}

function getDaysLeft(endDate: Date | null) {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const normalizedEndDate = new Date(endDate);
  normalizedEndDate.setHours(0, 0, 0, 0);

  return Math.ceil((normalizedEndDate.getTime() - today.getTime()) / 86400000);
}

type LeaseVisualState = 'normal' | 'h30' | 'h7' | 'h1' | 'overdue';

function getLeaseVisualState(daysLeft: number | null): LeaseVisualState {
  if (daysLeft === null || daysLeft > 30) return 'normal';
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 1) return 'h1';
  if (daysLeft <= 7) return 'h7';

  return 'h30';
}

function getLeaseVisualConfig(state: LeaseVisualState) {
  const configs = {
    normal: { border: 'rgba(34,197,94,0.24)', bg: '#afefb4', color: '#006e2f', labelKey: 'tenant.dashboard.leaseNormal' },
    h30: { border: 'rgba(234,179,8,0.35)', bg: '#fef3c7', color: '#a16207', labelKey: 'tenant.dashboard.leaseH30' },
    h7: { border: 'rgba(249,115,22,0.35)', bg: '#ffedd5', color: '#c2410c', labelKey: 'tenant.dashboard.leaseH7' },
    h1: { border: 'rgba(239,68,68,0.35)', bg: '#fee2e2', color: '#b91c1c', labelKey: 'tenant.dashboard.leaseH1' },
    overdue: { border: 'rgba(127,29,29,0.45)', bg: '#fee2e2', color: '#7f1d1d', labelKey: 'tenant.dashboard.leaseOverdueStatus' },
  } satisfies Record<LeaseVisualState, { border: string; bg: string; color: string; labelKey: string }>;

  return configs[state];
}

function hasActiveOccupancy(application: RentalApplication) {
  return application.payment_status === 'paid' && application.room_occupancy?.status === 'active';
}

function isAwaitingPayment(application: RentalApplication) {
  return application.status === 'approved' && application.payment_status !== 'paid';
}

function getApplicationPayment(application: RentalApplication | null, payments: Payment[]) {
  if (!application) return null;

  const payment = payments.find((item) => item.rental_application_id === application.id)
    ?? application.payment
    ?? null;

  return payment ? ({ ...payment, rental_application: application } as Payment) : null;
}

function getApplicationTotal(application: RentalApplication | null, payment: Payment | null) {
  if (!application) return 0;

  return getRentalPaymentBreakdown({
    monthlyPrice: application.room?.price,
    duration: application.duration,
    subtotalAmount: payment?.subtotal_amount ?? application.payment?.subtotal_amount,
    discountAmount: payment?.discount_amount ?? application.payment?.discount_amount,
    grossAmount: payment?.gross_amount ?? application.payment?.gross_amount,
  }).grossAmount;
}

function getRoomImage(room: ApiRoom) {
  return room.thumbnail
    || room.image_url
    || room.images?.find((image) => image.is_primary)?.image_url
    || room.images?.[0]?.image_url
    || '';
}

function getRoomAmenities(room: ApiRoom) {
  return room.facilities.map((facility) => ({
    icon: 'check_circle',
    label: facility.facility_name || facility.name || 'Fasilitas',
  }));
}

function TenantDashboardEmptyState({
  rooms,
  recommendationsError,
}: {
  rooms: ApiRoom[];
  recommendationsError: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-outline-variant-20 bg-white shadow-sm">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_280px] lg:items-center lg:p-10">
          <div className="max-w-2xl">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-primary">
              <span className="material-symbols-outlined">home_work</span>
            </span>
            <h3 className="mt-5 text-3xl font-extrabold leading-tight text-on-surface font-manrope">
              {t('tenant.dashboard.emptyTitle')}
            </h3>
            <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-on-surface-variant sm:text-base">
              {t('tenant.dashboard.emptyDescription')}
            </p>
            <div className="mt-6">
              <Link
                href="/rooms"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-sm transition hover:shadow-md"
              >
                {t('tenant.dashboard.viewRoomsCta')}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
          <div className="hidden rounded-3xl bg-surface-container-low p-5 lg:block">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t('tenant.dashboard.nextStep')}
              </p>
              <div className="mt-4 space-y-4">
                {[t('tenant.dashboard.stepChooseRoom'), t('tenant.dashboard.stepSubmitApplication'), t('tenant.dashboard.stepWaitReview')].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-xs font-extrabold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-sm font-bold text-on-surface">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {t('tenant.dashboard.availableRoomsEyebrow')}
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-on-surface font-manrope">
              {t('tenant.dashboard.recommendedRooms')}
            </h3>
          </div>
          <Link href="/rooms" className="text-sm font-bold text-primary hover:underline">
            {t('tenant.dashboard.viewAll')}
          </Link>
        </div>

        {recommendationsError ? (
          <EmptyState
            title={t('tenant.dashboard.recommendationsUnavailable')}
            description={recommendationsError}
          />
        ) : rooms.length === 0 ? (
          <EmptyState
            title={t('tenant.dashboard.noRecommendedRooms')}
            description={t('tenant.dashboard.noRecommendedRoomsDescription')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                name={room.room_name || room.name}
                location={room.branch?.branch_name || t('tenant.applications.branchUnset')}
                price={formatRupiah(room.price)}
                imageUrl={getRoomImage(room)}
                status={room.room_status}
                amenities={getRoomAmenities(room)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PendingApplicationState({ application, locale }: { application: RentalApplication; locale: Locale }) {
  const { t } = useLanguage();

  return (
    <section className="rounded-3xl border border-outline-variant-20 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined rounded-2xl bg-surface-container-low p-3 text-primary">
            hourglass_top
          </span>
          <div>
            <div className="mb-3">
              <RentalApplicationStatusBadge status={application.status} />
            </div>
            <h3 className="text-2xl font-extrabold text-on-surface font-manrope">
              {t('tenant.dashboard.pendingTitle')}
            </h3>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-on-surface-variant">
              {t('tenant.dashboard.pendingMessage')}
            </p>
          </div>
        </div>
        <Link
          href={`/tenant/rental-applications/${application.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant-30 bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-surface-container-low"
        >
          {t('tenant.dashboard.viewApplication')}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <ApplicationMetric
          icon="fact_check"
          label={t('owner.applications.applicationStatus')}
          value={t('status.pending')}
        />
        <ApplicationMetric
          icon="event"
          label={t('tenant.dashboard.submittedAt')}
          value={formatDate(application.created_at, locale)}
        />
        <ApplicationMetric
          icon="door_front"
          label={t('common.room')}
          value={application.room?.room_name || t('tenant.applications.roomUnavailable')}
        />
      </div>
    </section>
  );
}

function AwaitingPaymentState({
  application,
  amount,
}: {
  application: RentalApplication;
  amount: number;
}) {
  const { t } = useLanguage();

  return (
    <section
      className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
      style={{ borderColor: 'rgba(175,239,180,0.7)' }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined rounded-2xl bg-secondary-container p-3 text-primary">
            payments
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {t('tenant.dashboard.awaitingPaymentEyebrow')}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-on-surface font-manrope">
              {t('tenant.dashboard.awaitingPaymentTitle')}
            </h3>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-on-surface-variant">
              {t('tenant.dashboard.awaitingPaymentDescription')}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-surface-container-low p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {t('tenant.dashboard.paymentTotal')}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-on-surface font-manrope">
            {formatRupiah(amount)}
          </p>
          <p className="mt-1 text-sm font-semibold text-on-surface-variant">
            {application.room?.room_name || t('tenant.applications.roomUnavailable')}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <ApplicationMetric
            icon="door_front"
            label={t('common.room')}
            value={application.room?.room_name || t('tenant.applications.roomUnavailable')}
          />
          <ApplicationMetric
            icon="calendar_month"
            label={t('owner.applications.duration')}
            value={application.duration}
          />
        </div>
        <Link
          href={`/tenant/rental-applications/${application.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-sm transition hover:shadow-md"
        >
          {t('tenant.applications.payNow')}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
}

function ApplicationMetric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant-20 bg-surface-container-lowest p-4">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined rounded-xl bg-surface-container-low p-2 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
          <p className="mt-1 truncate text-sm font-extrabold text-on-surface">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Page() {
  const { user, logout, isLoading } = useAuth();
  const { locale, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recommendedRooms, setRecommendedRooms] = useState<ApiRoom[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState('');
  const [recommendationsError, setRecommendationsError] = useState('');
  const displayName = user?.full_name || t('common.tenant');
  const isProfileComplete = Boolean(user?.profile_completed);
  const activeApplication = useMemo(
    () => applications.find(hasActiveOccupancy) ?? null,
    [applications],
  );
  const pendingApplication = useMemo(
    () => applications.find((application) => application.status === 'pending') ?? null,
    [applications],
  );
  const awaitingPaymentApplication = useMemo(
    () => applications.find(isAwaitingPayment) ?? null,
    [applications],
  );
  const dashboardState = activeApplication
    ? 'active'
    : pendingApplication
      ? 'pending'
      : awaitingPaymentApplication
        ? 'awaiting-payment'
        : 'empty';
  const showActiveRoomHeader = dashboardState === 'active';
  const activePayment = getApplicationPayment(activeApplication, payments);
  const awaitingPayment = getApplicationPayment(awaitingPaymentApplication, payments);
  const awaitingPaymentTotal = getApplicationTotal(awaitingPaymentApplication, awaitingPayment);
  const visibleApplications = applications.slice(0, 3);
  const activeRoom = activeApplication?.room;
  const activeLeaseEndDate = parseDateOnly(activeApplication?.room_occupancy?.end_date)
    ?? calculateFallbackEndDate(activeApplication);
  const activeLeaseDaysLeft = getDaysLeft(activeLeaseEndDate);
  const activeLeaseVisualState = getLeaseVisualState(activeLeaseDaysLeft);
  const activeLeaseVisual = getLeaseVisualConfig(activeLeaseVisualState);
  const activeLeaseIsOverdue = typeof activeLeaseDaysLeft === 'number' && activeLeaseDaysLeft < 0;
  const paymentStatus = getPaymentStatusLabel(activePayment, t);

  useEffect(() => {
    if (document.getElementById('kos-styles')) return;
    const el = document.createElement('style');
    el.id = 'kos-styles';
    el.textContent = CUSTOM_STYLES;
    document.head.insertBefore(el, document.head.firstChild);
    return () => { document.getElementById('kos-styles')?.remove(); };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setDashboardLoading(true);

      const [applicationResult, paymentResult, roomResult] = await Promise.allSettled([
        getMyRentalApplications(),
        getMyPayments(),
        getRooms({ room_status: 'available', limit: 4 }),
      ]);

      if (!isMounted) {
        return;
      }

      if (applicationResult.status === 'fulfilled') {
        setApplications(applicationResult.value);
        setApplicationsError('');
      } else {
        setApplications([]);
        setApplicationsError(t('tenant.dashboard.applicationsLoadFailed'));
      }

      if (paymentResult.status === 'fulfilled') {
        setPayments(paymentResult.value);
      } else {
        setPayments([]);
      }

      if (roomResult.status === 'fulfilled') {
        setRecommendedRooms(roomResult.value.slice(0, 4));
        setRecommendationsError('');
      } else {
        setRecommendedRooms([]);
        setRecommendationsError(t('tenant.dashboard.recommendationsLoadFailed'));
      }

      setDashboardLoading(false);
    }

    if (!isLoading && user?.role === 'tenant') {
      void loadDashboardData();
    }

    const handleTenantDataSync = () => {
      void loadDashboardData();
    };

    window.addEventListener('tenant-data-sync', handleTenantDataSync);

    return () => {
      isMounted = false;
      window.removeEventListener('tenant-data-sync', handleTenantDataSync);
    };
  }, [isLoading, t, user?.role]);

  return (
    <div className="bg-background text-on-background min-h-screen flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside
        className={`sidebar-drawer ${sidebarOpen ? 'open' : 'closed'} h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 gap-2`}
      >
        {/* Logo */}
        <div className="mb-8 px-2">
          <img
            src="https://lh3.googleusercontent.com/aida/ADBb0uhRKxZcseWPGH2N6VtTFeq15Qvp-6BB9aT3okC6OoSCq7dfP48T_h-iGCkugUe9m6S2BZG_gvFzs6YtKJmiykqsKAc_PWQLubYJ8HFbnMGvt0Hq8MuFjC7kvnW73piUkySL2LHgQOfybQGTLvEWX_sx4JeG4Uk8EWKH5hN8sjlgqBPDYZYh5Z1NWMwSCFyhXtHLHP4z2QzFbsFjsvB9VcSbYe8oVqL6VqONm5wlYl6LwXU0SGfu9xmcb3RsLE16bEOaeZOD1MVWWw"
            alt="KosHandayani Logo"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map((item) =>
            item.active ? (
              <a
                key={item.labelKey}
                href={item.href}
                className="bg-green-50 text-green-700 rounded-lg flex items-center gap-3 px-4 py-3 font-semibold"
                style={{ transform: 'scale(0.95)' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
                <span className="font-inter text-sm">{t(item.labelKey)}</span>
              </a>
            ) : (
              <a
                key={item.labelKey}
                href={item.href}
                className="text-slate-500 hover:bg-slate-200 flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                style={{ transform: 'scale(0.95)' }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-inter text-sm">{t(item.labelKey)}</span>
              </a>
            )
          )}
        </nav>

        {/* User block */}
        <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0qnEsKVMHkHuca0IndT_fvNKEYkq444re0T0SQ1wlH3Ao-xgdTjbtpQ42CYPeXajYfa_uICvIWMBiYxVLLKhXfupVde0iiyhj1znXKqPxNIet20R1oXHrAR1FjXPw-pk3l9dhjbSQb7uAHzfaUN_gOTlt6Hf8aUNCytQSd-GOekETLIbLLwd7ZNFE2nwx7x2pBN629i3hxNXhVFDVoJB-_skTHFvwlAP3RbczParih48BRhT1GlBDISqk0EVh7s3652dROq_tvSZm"
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-on-surface truncate">{displayName}</p>
              <p className="text-on-surface-variant truncate" style={{ fontSize: '10px' }}>{t('tenant.dashboard.premiumTenant')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={isLoading}
            className="w-full py-2 bg-white text-error text-xs font-bold rounded-lg border border-error-10 hover-bg-error-5 transition-colors flex items-center justify-center gap-2"
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            {t('common.logout')}
          </button>
        </div>
      </aside>

      {/* ══════════════════ MAIN ══════════════════ */}
      <main className="main-offset flex-1 p-4 lg:p-8 overflow-y-auto min-h-screen">

        {/* Header */}
        <header className={`flex justify-between items-center ${showActiveRoomHeader ? 'mb-10' : 'mb-6'}`}>
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu-btn lg:hidden p-2 rounded-lg bg-surface-container-lowest shadow-sm"
              onClick={() => setSidebarOpen(true)}
              aria-label={t('nav.openMenu')}
            >
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </button>
            {showActiveRoomHeader && (
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-on-surface font-manrope tracking-tight">
                  {t('tenant.dashboard.welcome', { name: displayName })}
                </h2>
                <p className="text-on-surface-variant mt-1 font-medium text-sm lg:text-base">
                  {t('tenant.dashboard.subtitle')}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <span
              aria-label="Notifikasi belum tersedia"
              role="status"
              className="p-3 bg-surface-container-lowest rounded-xl shadow-sm text-on-surface-variant opacity-70"
            >
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </span>
            <span
              aria-label="Pengaturan cepat belum tersedia"
              role="status"
              className="p-3 bg-surface-container-lowest rounded-xl shadow-sm text-on-surface-variant opacity-70"
            >
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </span>
          </div>
        </header>

        {!isLoading && !isProfileComplete && (
          <div className="mb-8 bg-error-container border border-error-10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-error">warning</span>
              <div>
                <h3 className="font-bold text-on-error-container">Lengkapi profil untuk mengajukan sewa</h3>
                <p className="text-sm text-on-error-container mt-1">
                  Nomor WhatsApp, pekerjaan, dan alamat asal wajib diisi sebelum mengirim pengajuan.
                </p>
              </div>
            </div>
            <a
              href="/tenant/profil"
              className="bg-white text-error px-4 py-2 rounded-xl text-sm font-bold text-center border border-error-10"
            >
              Lengkapi Profil
            </a>
          </div>
        )}

        {dashboardLoading ? (
          <LoadingState
            title={t('tenant.dashboard.loadingTitle')}
            description={t('tenant.dashboard.loadingDescription')}
          />
        ) : applicationsError ? (
          <ErrorState
            title={t('tenant.dashboard.loadFailed')}
            description={applicationsError}
            actionLabel={t('common.tryAgain')}
            onAction={() => window.dispatchEvent(new Event('tenant-data-sync'))}
          />
        ) : dashboardState === 'empty' ? (
          <TenantDashboardEmptyState
            rooms={recommendedRooms}
            recommendationsError={recommendationsError}
          />
        ) : dashboardState === 'pending' && pendingApplication ? (
          <PendingApplicationState application={pendingApplication} locale={locale} />
        ) : dashboardState === 'awaiting-payment' && awaitingPaymentApplication ? (
          <AwaitingPaymentState
            application={awaitingPaymentApplication}
            amount={awaitingPaymentTotal}
          />
        ) : (
          <>
        {/* House Rules */}
        <section className="mb-10 rounded-2xl border border-outline-variant-20 bg-surface-container-low-50 p-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="material-symbols-outlined rounded-xl bg-white p-2 text-primary shadow-sm">gavel</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Peraturan Hunian
              </h4>
              <p className="mt-1 text-sm font-medium leading-6 text-on-surface-variant">
                Ringkasan aturan utama selama tinggal di KosHandayani.
              </p>
            </div>
          </div>
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {HOUSE_RULES.map((rule, index) => (
              <li
                key={rule}
                className="flex items-start gap-3 rounded-xl border border-outline-variant-20 bg-white/70 px-3 py-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-container text-[11px] font-extrabold text-primary">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold leading-6 text-on-surface">{rule}</span>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="mb-10 rounded-2xl p-5 lg:p-6 shadow-sm"
          style={{
            background: '#ffffff',
            border: `1px solid ${activeLeaseVisual.border}`,
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span
                className="material-symbols-outlined rounded-xl p-3"
                style={{
                  background: activeLeaseVisual.bg,
                  color: activeLeaseVisual.color,
                }}
              >
                event_available
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('tenant.dashboard.activeLease')}
                  </p>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide"
                    style={{ background: activeLeaseVisual.bg, color: activeLeaseVisual.color }}
                  >
                    {t(activeLeaseVisual.labelKey)}
                  </span>
                </div>
                <h3 className="mt-1 text-xl font-extrabold text-on-surface font-manrope">
                  {activeRoom?.room_name || t('tenant.dashboard.noActiveRoom')}
                </h3>
                <p className="mt-1 text-sm font-semibold text-on-surface-variant">
                  {t('tenant.dashboard.leaseEndsAt')}: {activeLeaseEndDate ? formatDate(activeLeaseEndDate.toISOString(), locale) : '-'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-end md:text-right">
              <p
                className="text-2xl font-extrabold font-manrope"
                style={{ color: activeLeaseVisual.color }}
              >
                {activeLeaseIsOverdue
                  ? t('tenant.dashboard.leaseOverdue')
                  : activeLeaseDaysLeft !== null
                    ? t('tenant.dashboard.daysLeft', { count: Math.max(0, activeLeaseDaysLeft) })
                    : '-'}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t('tenant.dashboard.remainingLease')}
              </p>
              <Link
                href="/tenant/perpanjang-sewa"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-sm transition hover:shadow-md"
              >
                {t('tenant.renewal.cta')}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* ── Main billing card ── */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 lg:p-8 flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {t('tenant.dashboard.rentalStatus')} ({activeApplication?.payment_status === 'paid' ? t('status.active') : activeApplication ? t('common.rentalApplication') : t('empty.noData')})
                  </span>
                  <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                    {t('tenant.dashboard.currentBill')}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl lg:text-4xl font-extrabold text-on-surface font-manrope">
                      {formatRupiah(activePayment?.gross_amount)}
                    </span>
                    <span className="text-on-surface-variant font-medium">{activePayment ? paymentStatus : ''}</span>
                  </div>
                  <p className="text-error font-bold text-sm mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">event</span>
                    {activePayment?.paid_at
                      ? t('tenant.dashboard.paidAt', { date: formatDate(activePayment.paid_at, locale) })
                      : activeApplication?.move_in_date
                        ? t('tenant.dashboard.startAt', { date: formatDate(activeApplication.move_in_date, locale) })
                        : t('tenant.dashboard.noSchedule')}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-1">
                    {t('tenant.dashboard.paymentMethod')}
                  </p>
                  <p className="text-sm font-semibold text-on-surface">{activePayment?.payment_type || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <Link href="/tenant/tagihan" className="bg-linear-to-r from-primary to-primary-container text-on-primary py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 hover-shadow-primary-20 transition-all active:scale-95 group">
                  {getPaymentMetaFromPayment(activePayment).isPaid ? t('tenant.dashboard.viewBill') : t('tenant.applications.payNow')}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
                <Link href="/tenant/tagihan" className="bg-surface-container-low text-on-surface py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 hover-bg-surface-container-high transition-all active:scale-95">
                  {t('tenant.dashboard.billDetails')}
                  <span className="material-symbols-outlined">receipt_long</span>
                </Link>
              </div>
            </div>
            <div className="bg-surface-container-low px-6 lg:px-8 py-4 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant font-medium">
                {t('tenant.dashboard.lastPaid', { date: formatDate(activePayment?.paid_at, locale) })}
              </p>
              <Link href="/tenant/riwayat" className="text-xs text-primary font-bold hover:underline">
                {t('tenant.dashboard.previousInvoice')}
              </Link>
            </div>
          </div>

          {/* ── Room info card ── */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-2xl p-6 lg:p-8 relative overflow-hidden flex flex-col">
            <div className="relative z-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                {t('tenant.dashboard.yourResidence')}
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-on-surface font-manrope leading-tight">
                {activeRoom?.room_name || t('tenant.dashboard.noActiveRoom')}
              </h3>
              <p className="text-on-surface-variant font-semibold flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-base">location_on</span>
                {activeRoom?.branch?.branch_name || t('tenant.applications.branchUnset')}
              </p>
            </div>
            <div className="mt-8 flex-1">
              <div className="flex items-center gap-4 mb-6">
                {ROOM_AMENITIES.map((icon) => (
                  <div
                    key={icon}
                    className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                ))}
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xs font-bold text-on-surface-variant">
                  +4
                </div>
              </div>
            </div>
            <div className="relative mt-auto">
              <img
                src={activeRoom?.thumbnail || activeRoom?.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwEFa1B7bMp3MpBhenzOvyffcPdrh39WdKdbm1KUM8U085YD1T7EaIU5VlsP_N_uKwbUbXuZHRf2nlM7sz_8mWwvO35Q-xNRRTu0NAsRmelljA6ntwBx6bYCklPej3fsGXzKZ9qOSgwwtsWV9vkFJa9jBZrBXV1wrCx72UKXPwDJLHuo4ua95ICftEoQmxKN04tU-7y6irRemrxebklyqJicNqKnKbeM5q_fjMSa3kVwIYwJjD7zfY_apG4NfuAiNyQGPbpgUFD2N_'}
                alt={activeRoom?.room_name || t('common.room')}
                className="w-full h-32 object-cover rounded-xl shadow-inner brightness-90"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent rounded-xl flex items-end p-4">
                <Link href={activeRoom?.id ? `/room/${activeRoom.id}` : '/rooms'} className="text-white text-xs font-bold flex items-center gap-2 hover:gap-3 transition-all">
                  Lihat Kamar
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="col-span-12 mt-4">
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6 px-2">
              Akses Cepat
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              {QUICK_ACTIONS.map((action) => {
                const content = (
                  <>
                  <div
                    className={`w-12 h-12 rounded-xl ${action.bg} ${action.color} flex items-center justify-center mb-4 transition-transform ${action.href ? 'group-hover:scale-110' : ''}`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {action.icon}
                    </span>
                  </div>
                  <h5 className="font-bold text-on-surface">{action.title}</h5>
                  <p className="text-xs text-on-surface-variant mt-1">{action.desc}</p>
                  </>
                );

                return action.href ? (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group bg-surface-container-lowest p-5 lg:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={action.title}
                    aria-disabled="true"
                    className="bg-surface-container-lowest p-5 lg:p-6 rounded-2xl shadow-sm opacity-75"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Announcements ── */}
          <div className="col-span-12 mt-8">
            <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-bold font-manrope text-on-surface">
                  Pengumuman Terkini
                </h4>
                <span className="text-on-surface-variant text-sm font-bold">Informasi</span>
              </div>
              {ANNOUNCEMENTS.length === 0 ? (
                <EmptyState
                  title={t('tenant.dashboard.noAnnouncements')}
                  description={t('tenant.dashboard.noAnnouncementsDescription')}
                />
              ) : (
              <div className="space-y-6">
                {ANNOUNCEMENTS.map((item, idx) => (
                  <div
                    key={item.title}
                    className={`flex gap-4 lg:gap-6 items-start${idx > 0 ? ' pt-6 border-t border-slate-100' : ''}`}
                  >
                    {item.type === 'image' && item.src ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h6 className="font-bold text-on-surface">{item.title}</h6>
                        {item.badge && (
                          <span className="bg-surface-container-high px-2 py-1 rounded text-on-surface-variant font-bold whitespace-nowrap shrink-0" style={{ fontSize: '10px' }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-1">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

          <div className="col-span-12 mt-8">
            <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold font-manrope text-on-surface">
                  {t('tenant.applications.title')}
                </h4>
                <Link href="/tenant/rental-applications" className="text-primary font-bold text-sm">
                  {t('tenant.dashboard.viewAll')}
                </Link>
              </div>
              {applicationsError ? (
                <p className="text-error text-sm font-bold">{applicationsError}</p>
              ) : visibleApplications.length === 0 ? (
                <EmptyState
                  title={t('empty.noApplications')}
                  description={t('owner.applications.emptyDescription')}
                />
              ) : (
                <div className="space-y-3">
                  {visibleApplications.map((application) => (
                    <Link
                      key={application.id}
                      href={`/tenant/rental-applications/${application.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-low p-4 text-on-surface no-underline"
                    >
                      <div>
                        <p className="font-bold">{application.room?.room_name || t('tenant.applications.roomUnavailable')}</p>
                        <p className="text-sm text-on-surface-variant">{application.room?.branch?.branch_name || t('tenant.applications.branchUnset')} - {application.duration}</p>
                      </div>
                      <RentalApplicationStatusBadge status={application.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-16 pb-8 flex flex-col items-center gap-4 text-slate-500 text-xs">
          <p>© 2026 KosHandayani. Digital Concierge Property Management.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <span>Tentang Kami</span>
            <span>Syarat &amp; Ketentuan</span>
            <span>Kebijakan Privasi</span>
          </div>
        </footer>
      </main>

      {/* FAB */}
      <div
        aria-label="Chat belum tersedia"
        role="status"
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary/80 text-on-primary rounded-full shadow-2xl flex items-center justify-center z-50"
      >
        <span className="material-symbols-outlined">chat</span>
      </div>
    </div>
  );
}
