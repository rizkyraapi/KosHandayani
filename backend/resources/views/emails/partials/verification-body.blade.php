<p style="margin:0; color:#3d4a3d; font-size:15px; line-height:25px;">
    Terima kasih sudah mendaftar. Verifikasi email diperlukan agar akun Anda terhubung dengan aman ke layanan pengajuan sewa dan pembayaran KosHandayani.
</p>

@include('emails.components.cta-button', [
    'url' => $verificationUrl,
    'label' => 'Verifikasi Email',
])

<div style="margin-top:28px; padding:18px; border-radius:16px; background:#f4f8f2; border:1px solid #dfe8dc;">
    <p style="margin:0 0 8px; color:#111c2d; font-size:13px; line-height:20px; font-weight:800;">
        Tombol tidak bisa dibuka?
    </p>
    <p style="margin:0; color:#536253; font-size:13px; line-height:20px;">
        Salin dan buka URL berikut di browser Anda:
    </p>
    <p style="margin:10px 0 0; word-break:break-all; color:#006e2f; font-size:12px; line-height:19px;">
        <a href="{{ $verificationUrl }}" style="color:#006e2f; text-decoration:underline;">{{ $verificationUrl }}</a>
    </p>
</div>
