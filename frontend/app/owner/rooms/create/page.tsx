'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom, type ApiRoom } from '@/lib/api';
import { getAuthErrorMessage } from '@/lib/auth';

const facilityOptions = [
  'Wi-Fi',
  'AC',
  'Kamar Mandi Dalam',
  'Water Heater',
  'Meja Belajar',
  'Lemari',
  'Laundry',
  'Cleaning Service',
];

const roomTypes: Array<{ label: string; value: ApiRoom['room_type'] }> = [
  { label: 'Single', value: 'single' },
  { label: 'Double', value: 'double' },
  { label: 'Suite', value: 'suite' },
];

const colors = {
  primary: '#006e2f',
  primarySoft: '#e7f8eb',
  surface: '#f9f9ff',
  panel: '#ffffff',
  field: '#f0f3ff',
  fieldStrong: '#dee8ff',
  text: '#111c2d',
  muted: '#3d4a3d',
  border: '#bccbb9',
  error: '#ba1a1a',
};

function formatError(error: unknown) {
  return getAuthErrorMessage(error, 'Gagal menyimpan kamar. Periksa kembali data yang diisi.');
}

export default function Page() {
  const router = useRouter();
  const [form, setForm] = useState({
    room_name: '',
    branch: '',
    room_type: 'single' as ApiRoom['room_type'],
    price: '',
    max_guest: '1',
    description: '',
    is_available: true,
  });
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const previews = useMemo(
    () => images.map((image) => ({ file: image, url: URL.createObjectURL(image) })),
    [images],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function toggleFacility(facility: string) {
    setSelectedFacilities((current) =>
      current.includes(facility)
        ? current.filter((item) => item !== facility)
        : [...current, facility],
    );
  }

  function addImages(fileList: FileList | null) {
    if (!fileList) return;

    const nextImages = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    setImages((current) => [...current, ...nextImages].slice(0, 8));
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.room_name.trim()) {
      setError('Nama kamar wajib diisi.');
      return;
    }

    if (!form.branch.trim()) {
      setError('Cabang wajib diisi.');
      return;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError('Harga kamar harus lebih dari 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createRoom({
        room_name: form.room_name.trim(),
        room_type: form.room_type,
        branch: form.branch.trim(),
        price,
        max_guest: Number(form.max_guest) || 1,
        description: form.description.trim(),
        is_available: form.is_available,
        facilities: selectedFacilities,
        images,
      });
      setSuccess('Kamar berhasil disimpan.');
      setForm({
        room_name: '',
        branch: '',
        room_type: 'single',
        price: '',
        max_guest: '1',
        description: '',
        is_available: true,
      });
      setSelectedFacilities([]);
      setImages([]);
      setTimeout(() => router.push('/owner/rooms'), 700);
    } catch (submitError) {
      setError(formatError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 48,
    border: 0,
    borderRadius: 8,
    background: colors.field,
    color: colors.text,
    padding: '12px 14px',
    fontSize: 15,
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    color: colors.muted,
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: '0.02em',
  };

  return (
    <main style={{ minHeight: '100vh', background: colors.surface, padding: '40px clamp(16px, 4vw, 48px)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          direction: ltr;
          -webkit-font-smoothing: antialiased;
        }
        .room-create-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .facility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 12px;
        }
        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 14px;
        }
        @media (max-width: 760px) {
          .room-create-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => router.push('/owner/rooms')}
          style={{
            border: 0,
            background: 'transparent',
            color: colors.primary,
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            marginBottom: 22,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          Kembali
        </button>

        <header style={{ marginBottom: 28 }}>
          <p style={{ color: colors.primary, fontWeight: 900, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Manajemen Properti
          </p>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)', color: colors.text, margin: 0, lineHeight: 1.1 }}>
            Tambah Kamar Baru
          </h1>
          <p style={{ color: colors.muted, marginTop: 10, maxWidth: 620, lineHeight: 1.6 }}>
            Lengkapi detail kamar, fasilitas, dan galeri foto agar data kamar langsung tampil di daftar kamar.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          style={{
            background: colors.panel,
            borderRadius: 12,
            border: '1px solid rgba(188,203,185,0.22)',
            boxShadow: '0 18px 42px rgba(17,28,45,0.06)',
            padding: 'clamp(20px, 4vw, 34px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
          }}
        >
          {(error || success) && (
            <p
              style={{
                margin: 0,
                padding: '12px 14px',
                borderRadius: 8,
                fontWeight: 800,
                color: error ? colors.error : colors.primary,
                background: error ? '#ffdad6' : colors.primarySoft,
              }}
            >
              {error || success}
            </p>
          )}

          <section>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 19, margin: '0 0 16px', color: colors.text }}>
              Detail Kamar
            </h2>
            <div className="room-create-grid">
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={labelStyle}>Nama Kamar</span>
                <input
                  style={inputStyle}
                  value={form.room_name}
                  disabled={isSubmitting}
                  placeholder="Contoh: A-101"
                  onChange={(event) => setForm((current) => ({ ...current, room_name: event.target.value }))}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={labelStyle}>Cabang</span>
                <input
                  style={inputStyle}
                  value={form.branch}
                  disabled={isSubmitting}
                  placeholder="Contoh: Cabang Setiabudi"
                  onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={labelStyle}>Harga per Bulan</span>
                <input
                  style={inputStyle}
                  type="number"
                  min={0}
                  value={form.price}
                  disabled={isSubmitting}
                  placeholder="1500000"
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={labelStyle}>Maksimal Tamu</span>
                <input
                  style={inputStyle}
                  type="number"
                  min={1}
                  value={form.max_guest}
                  disabled={isSubmitting}
                  onChange={(event) => setForm((current) => ({ ...current, max_guest: event.target.value }))}
                />
              </label>
            </div>

            <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
              <span style={labelStyle}>Tipe Kamar</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                {roomTypes.map((type) => {
                  const active = form.room_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setForm((current) => ({ ...current, room_type: type.value }))}
                      style={{
                        minHeight: 46,
                        border: `2px solid ${active ? colors.primary : 'transparent'}`,
                        borderRadius: 8,
                        background: active ? colors.primarySoft : colors.field,
                        color: active ? colors.primary : colors.muted,
                        fontWeight: 900,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={labelStyle}>Deskripsi</span>
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                value={form.description}
                disabled={isSubmitting}
                placeholder="Tuliskan detail kamar, suasana, atau catatan khusus."
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>

            <label style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, width: 'fit-content', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.is_available}
                disabled={isSubmitting}
                onChange={(event) => setForm((current) => ({ ...current, is_available: event.target.checked }))}
                style={{ width: 18, height: 18, accentColor: colors.primary }}
              />
              <span style={{ color: colors.muted, fontWeight: 800 }}>Kamar tersedia</span>
            </label>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 19, margin: '0 0 16px', color: colors.text }}>
              Fasilitas
            </h2>
            <div className="facility-grid">
              {facilityOptions.map((facility) => {
                const active = selectedFacilities.includes(facility);
                return (
                  <label
                    key={facility}
                    style={{
                      minHeight: 48,
                      borderRadius: 8,
                      background: active ? colors.primarySoft : colors.field,
                      color: active ? colors.primary : colors.muted,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      fontWeight: 800,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={isSubmitting}
                      onChange={() => toggleFacility(facility)}
                      style={{ width: 18, height: 18, accentColor: colors.primary }}
                    />
                    {facility}
                  </label>
                );
              })}
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 19, margin: '0 0 16px', color: colors.text }}>
              Foto Kamar
            </h2>
            <label
              style={{
                minHeight: 150,
                border: `2px dashed ${colors.border}`,
                borderRadius: 10,
                background: colors.field,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 8,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                color: colors.muted,
                fontWeight: 800,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 34, color: colors.primary }}>add_photo_alternate</span>
              Pilih beberapa foto kamar
              <span style={{ fontSize: 12, fontWeight: 600 }}>JPG, PNG, atau WEBP. Foto pertama menjadi thumbnail.</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isSubmitting}
                onChange={(event) => {
                  addImages(event.target.files);
                  event.currentTarget.value = '';
                }}
                style={{ display: 'none' }}
              />
            </label>

            {previews.length > 0 && (
              <div className="preview-grid" style={{ marginTop: 16 }}>
                {previews.map((preview, index) => (
                  <div key={`${preview.file.name}-${index}`} style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 8, overflow: 'hidden', background: colors.fieldStrong }}>
                    <img src={preview.url} alt={preview.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {index === 0 && (
                      <span style={{ position: 'absolute', left: 8, top: 8, background: colors.primary, color: '#fff', borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 900 }}>
                        Thumbnail
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        border: 0,
                        background: 'rgba(17,28,45,0.72)',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap', borderTop: `1px solid ${colors.fieldStrong}`, paddingTop: 24 }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => router.push('/owner/rooms')}
              style={{
                minHeight: 46,
                padding: '0 24px',
                border: 0,
                borderRadius: 8,
                background: colors.field,
                color: colors.muted,
                fontWeight: 900,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                minHeight: 46,
                padding: '0 28px',
                border: 0,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.primary}, #22c55e)`,
                color: '#fff',
                fontWeight: 900,
                boxShadow: '0 12px 24px rgba(0,110,47,0.22)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kamar'}
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>save</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
