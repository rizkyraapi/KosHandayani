'use client';

import axios from 'axios';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { createRoom, getBranches, getRoomById, updateRoom, type ApiBranch, type ApiRoom } from '@/lib/api';
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

const genderTypes: Array<{ label: string; value: ApiRoom['gender_type'] }> = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Mixed', value: 'mixed' },
];

const roomStatuses: Array<{ labelKey: string; value: ApiRoom['room_status'] }> = [
  { labelKey: 'status.available', value: 'available' },
  { labelKey: 'status.occupied', value: 'occupied' },
  { labelKey: 'status.maintenance', value: 'maintenance' },
];

const minRoomImages = 4;
const maxRoomImages = 10;
const maxRoomImageSizeKb = 10240;
const maxRoomImageSizeMb = maxRoomImageSizeKb / 1024;

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

function readableRoomField(field: string) {
  if (field === 'room_name') return 'Nama kamar';
  if (field === 'branch_id') return 'Cabang';
  if (field === 'room_type') return 'Tipe kamar';
  if (field === 'gender_type') return 'Gender';
  if (field === 'room_status') return 'Status kamar';
  if (field === 'price') return 'Harga';
  if (field === 'description') return 'Deskripsi';
  if (field === 'max_guest') return 'Maksimal tamu';
  if (field === 'facilities') return 'Fasilitas';
  if (field.startsWith('facilities.')) return `Fasilitas #${Number(field.split('.')[1]) + 1}`;
  if (field === 'images') return 'Foto kamar';
  if (field.startsWith('images.')) return `Foto #${Number(field.split('.')[1]) + 1}`;

  return field;
}

function readableRoomErrorMessage(message: string, field: string) {
  const label = readableRoomField(field);

  if (message.includes('must not be greater than 10240 kilobytes')) {
    return `${label} maksimal ${maxRoomImageSizeMb} MB per foto.`;
  }

  if (message.includes('must be at least 4')) {
    return `${label} minimal ${minRoomImages} foto.`;
  }

  if (message.includes('must not have more than 10')) {
    return `${label} maksimal ${maxRoomImages} foto.`;
  }

  if (message.includes('must be an image')) {
    return `${label} harus berupa file gambar.`;
  }

  if (message.includes('must be a file of type')) {
    return `${label} harus berformat JPG, JPEG, PNG, atau WEBP.`;
  }

  if (message.includes('field is required')) {
    return `${label} wajib diisi.`;
  }

  return `${label}: ${message}`;
}

function formatError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 413) {
      return `Ukuran upload terlalu besar. Pastikan tiap foto maksimal ${maxRoomImageSizeMb} MB dan total file tidak berlebihan.`;
    }

    const data = error.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
    const errors = data?.errors;

    if (errors) {
      const [field, value] = Object.entries(errors)[0] ?? [];
      const firstMessage = Array.isArray(value) ? value[0] : value;

      if (field && firstMessage) {
        return readableRoomErrorMessage(firstMessage, field);
      }
    }
  }

  return getAuthErrorMessage(error, 'Gagal menyimpan kamar. Periksa kembali data yang diisi.');
}

function RoomFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const editRoomId = searchParams.get('edit');
  const isEditMode = Boolean(editRoomId);
  const [form, setForm] = useState({
    room_name: '',
    branch_id: '',
    room_type: 'single' as ApiRoom['room_type'],
    gender_type: 'mixed' as ApiRoom['gender_type'],
    room_status: 'available' as ApiRoom['room_status'],
    price: '',
    max_guest: '1',
    description: '',
  });
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ApiRoom['images']>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState(Boolean(editRoomId));
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

  useEffect(() => {
    let isMounted = true;

    async function loadBranches() {
      try {
        setIsLoadingBranches(true);
        const data = await getBranches();

        if (isMounted) {
          setBranches(data);
          setForm((current) => ({
            ...current,
            branch_id: current.branch_id || (data[0] ? String(data[0].id) : ''),
          }));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(formatError(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoadingBranches(false);
        }
      }
    }

    loadBranches();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!editRoomId) {
      return;
    }

    const roomId = editRoomId;
    let isMounted = true;

    async function loadRoom() {
      try {
        setIsLoadingRoom(true);
        setError('');
        const room = await getRoomById(roomId);

        if (!isMounted) {
          return;
        }

        setForm({
          room_name: room.room_name || '',
          branch_id: room.branch_id ? String(room.branch_id) : '',
          room_type: room.room_type,
          gender_type: room.gender_type,
          room_status: room.room_status,
          price: String(room.price ?? ''),
          max_guest: String(room.max_guest ?? 1),
          description: room.description || '',
        });
        setSelectedFacilities(room.facilities.map((facility) => facility.facility_name || facility.name || '').filter(Boolean));
        setExistingImages(room.images);
      } catch (loadError) {
        if (isMounted) {
          setError(formatError(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoom(false);
        }
      }
    }

    loadRoom();

    return () => {
      isMounted = false;
    };
  }, [editRoomId]);

  function toggleFacility(facility: string) {
    setSelectedFacilities((current) =>
      current.includes(facility)
        ? current.filter((item) => item !== facility)
        : [...current, facility],
    );
  }

  function addImages(fileList: FileList | null) {
    if (!fileList) return;

    const files = Array.from(fileList);
    const invalidType = files.find((file) => !file.type.startsWith('image/'));

    if (invalidType) {
      setError(`${invalidType.name} bukan file gambar yang valid.`);
      return;
    }

    const oversized = files.find((file) => file.size > maxRoomImageSizeKb * 1024);

    if (oversized) {
      setError(`${oversized.name} terlalu besar. Maksimal ${maxRoomImageSizeMb} MB per foto.`);
      return;
    }

    setError('');
    setImages((current) => [...current, ...files].slice(0, Math.max(0, maxRoomImages - existingImages.length)));
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  }

  function removeExistingImage(imageId: number) {
    setExistingImages((current) => current.filter((image) => image.id !== imageId));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const nextImages = [...current];
      [nextImages[index], nextImages[targetIndex]] = [nextImages[targetIndex], nextImages[index]];

      return nextImages;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.room_name.trim()) {
      setError('Nama kamar wajib diisi.');
      return;
    }

    if (!form.branch_id) {
      setError('Cabang wajib diisi.');
      return;
    }

    if (existingImages.length + images.length < minRoomImages) {
      setError(`Minimal upload ${minRoomImages} foto kamar.`);
      return;
    }

    if (existingImages.length + images.length > maxRoomImages) {
      setError(`Maksimal upload ${maxRoomImages} foto kamar.`);
      return;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError('Harga kamar harus lebih dari 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        room_name: form.room_name.trim(),
        room_type: form.room_type,
        branch_id: Number(form.branch_id),
        gender_type: form.gender_type,
        room_status: form.room_status,
        price,
        max_guest: Number(form.max_guest) || 1,
        description: form.description.trim(),
        facilities: selectedFacilities,
        images,
      };

      if (isEditMode && editRoomId) {
        await updateRoom(editRoomId, {
          ...payload,
          existing_image_ids: existingImages.map((image) => image.id),
        });
      } else {
        await createRoom(payload);
      }

      setSuccess(isEditMode ? 'Kamar berhasil diperbarui.' : 'Kamar berhasil disimpan.');
      setForm({
        room_name: '',
        branch_id: branches[0] ? String(branches[0].id) : '',
        room_type: 'single',
        gender_type: 'mixed',
        room_status: 'available',
        price: '',
        max_guest: '1',
        description: '',
      });
      setSelectedFacilities([]);
      setExistingImages([]);
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
            {isEditMode ? 'Edit Kamar' : 'Tambah Kamar Baru'}
          </h1>
          <p style={{ color: colors.muted, marginTop: 10, maxWidth: 620, lineHeight: 1.6 }}>
            {isEditMode
              ? 'Perbarui detail kamar, fasilitas, dan galeri foto dengan form yang sama seperti tambah kamar.'
              : 'Lengkapi detail kamar, fasilitas, dan galeri foto agar data kamar langsung tampil di daftar kamar.'}
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

          {isLoadingRoom && (
            <p
              style={{
                margin: 0,
                padding: '12px 14px',
                borderRadius: 8,
                fontWeight: 800,
                color: colors.muted,
                background: colors.field,
              }}
            >
              Memuat data kamar...
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
                  disabled={isSubmitting || isLoadingRoom}
                  placeholder="Contoh: A-101"
                  onChange={(event) => setForm((current) => ({ ...current, room_name: event.target.value }))}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={labelStyle}>Cabang</span>
                <select
                  style={inputStyle}
                  value={form.branch_id}
                  disabled={isSubmitting || isLoadingBranches || isLoadingRoom}
                  onChange={(event) => setForm((current) => ({ ...current, branch_id: event.target.value }))}
                >
                  <option value="">{isLoadingBranches ? 'Memuat cabang...' : 'Pilih Cabang'}</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={labelStyle}>Harga per Bulan</span>
                <input
                  style={inputStyle}
                  type="number"
                  min={0}
                  value={form.price}
                  disabled={isSubmitting || isLoadingRoom}
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
                  disabled={isSubmitting || isLoadingRoom}
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
                      disabled={isSubmitting || isLoadingRoom}
                      onClick={() => setForm((current) => ({ ...current, room_type: type.value }))}
                      style={{
                        minHeight: 46,
                        border: `2px solid ${active ? colors.primary : 'transparent'}`,
                        borderRadius: 8,
                        background: active ? colors.primarySoft : colors.field,
                        color: active ? colors.primary : colors.muted,
                        fontWeight: 900,
                        cursor: isSubmitting || isLoadingRoom ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 18 }} className="room-create-grid">
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={labelStyle}>Gender Type</span>
                <select
                  style={inputStyle}
                  value={form.gender_type}
                  disabled={isSubmitting || isLoadingRoom}
                  onChange={(event) => setForm((current) => ({ ...current, gender_type: event.target.value as ApiRoom['gender_type'] }))}
                >
                  {genderTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={labelStyle}>{t('owner.rooms.roomStatus')}</span>
                <select
                  style={inputStyle}
                  value={form.room_status}
                  disabled={isSubmitting || isLoadingRoom}
                  onChange={(event) => setForm((current) => ({ ...current, room_status: event.target.value as ApiRoom['room_status'] }))}
                >
                  {roomStatuses.map((status) => (
                    <option key={status.value} value={status.value}>{t(status.labelKey)}</option>
                  ))}
                </select>
              </label>
            </div>

            <label style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={labelStyle}>Deskripsi</span>
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                value={form.description}
                disabled={isSubmitting || isLoadingRoom}
                placeholder="Tuliskan detail kamar, suasana, atau catatan khusus."
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
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
                      cursor: isSubmitting || isLoadingRoom ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={isSubmitting || isLoadingRoom}
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
                cursor: isSubmitting || isLoadingRoom ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                color: colors.muted,
                fontWeight: 800,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 34, color: colors.primary }}>add_photo_alternate</span>
              Pilih beberapa foto kamar
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                Minimal 4 photos. Maximum 10 photos. Max 10 MB each. First uploaded photo becomes room thumbnail.
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isSubmitting || isLoadingRoom}
                onChange={(event) => {
                  addImages(event.target.files);
                  event.currentTarget.value = '';
                }}
                style={{ display: 'none' }}
              />
            </label>

            {(existingImages.length > 0 || previews.length > 0) && (
              <div className="preview-grid" style={{ marginTop: 16 }}>
                {existingImages.map((image, index) => (
                  <div key={image.id} style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 8, overflow: 'hidden', background: colors.fieldStrong }}>
                    <img src={image.image_url} alt={`Foto kamar ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', left: 8, bottom: 8, minWidth: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(17,28,45,0.78)', color: '#fff', borderRadius: 999, fontSize: 12, fontWeight: 900 }}>
                      {index + 1}
                    </span>
                    {index === 0 && (
                      <span style={{ position: 'absolute', left: 8, top: 8, background: colors.primary, color: '#fff', borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 900 }}>
                        Thumbnail Utama
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={isSubmitting || isLoadingRoom}
                      onClick={() => removeExistingImage(image.id)}
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
                        cursor: isSubmitting || isLoadingRoom ? 'not-allowed' : 'pointer',
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
                {previews.map((preview, index) => (
                  <div key={`${preview.file.name}-${index}`} style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 8, overflow: 'hidden', background: colors.fieldStrong }}>
                    <img src={preview.url} alt={preview.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', left: 8, bottom: 8, minWidth: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(17,28,45,0.78)', color: '#fff', borderRadius: 999, fontSize: 12, fontWeight: 900 }}>
                      {existingImages.length + index + 1}
                    </span>
                    {existingImages.length === 0 && index === 0 && (
                      <span style={{ position: 'absolute', left: 8, top: 8, background: colors.primary, color: '#fff', borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 900 }}>
                        Thumbnail Utama
                      </span>
                    )}
                    <div style={{ position: 'absolute', right: 46, top: 8, display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        aria-label="Geser foto ke kiri"
                        disabled={isSubmitting || index === 0}
                        onClick={() => moveImage(index, -1)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          border: 0,
                          background: index === 0 ? 'rgba(17,28,45,0.32)' : 'rgba(17,28,45,0.72)',
                          color: '#fff',
                          cursor: isSubmitting || index === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                      </button>
                      <button
                        type="button"
                        aria-label="Geser foto ke kanan"
                        disabled={isSubmitting || index === previews.length - 1}
                        onClick={() => moveImage(index, 1)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          border: 0,
                          background: index === previews.length - 1 ? 'rgba(17,28,45,0.32)' : 'rgba(17,28,45,0.72)',
                          color: '#fff',
                          cursor: isSubmitting || index === previews.length - 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting || isLoadingRoom}
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
              disabled={isSubmitting || isLoadingRoom}
              onClick={() => router.push('/owner/rooms')}
              style={{
                minHeight: 46,
                padding: '0 24px',
                border: 0,
                borderRadius: 8,
                background: colors.field,
                color: colors.muted,
                fontWeight: 900,
                cursor: isSubmitting || isLoadingRoom ? 'not-allowed' : 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingRoom}
              style={{
                minHeight: 46,
                padding: '0 28px',
                border: 0,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.primary}, #22c55e)`,
                color: '#fff',
                fontWeight: 900,
                boxShadow: '0 12px 24px rgba(0,110,47,0.22)',
                cursor: isSubmitting || isLoadingRoom ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Perbarui Kamar' : 'Simpan Kamar'}
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>save</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RoomFormPage />
    </Suspense>
  );
}
