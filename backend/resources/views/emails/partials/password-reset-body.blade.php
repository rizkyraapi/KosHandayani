<p style="margin:0; color:#3d4a3d; font-size:15px; line-height:25px;">
    Gunakan tombol di bawah ini untuk membuat kata sandi baru. Tautan mengikuti masa berlaku reset password yang dikonfigurasi di sistem.
</p>

@include('emails.components.cta-button', [
    'url' => $resetUrl,
    'label' => 'Reset Kata Sandi',
])

<div style="margin-top:28px; padding:18px; border-radius:16px; background:#f4f8f2; border:1px solid #dfe8dc;">
    <p style="margin:0 0 8px; color:#111c2d; font-size:13px; line-height:20px; font-weight:800;">
        Jika Anda tidak meminta reset password, abaikan email ini.
    </p>
    <p style="margin:0; color:#536253; font-size:13px; line-height:20px;">
        Tombol tidak bisa dibuka? Salin dan buka URL berikut di browser Anda:
    </p>
    <p style="margin:10px 0 0; word-break:break-all; color:#006e2f; font-size:12px; line-height:19px;">
        <a href="{{ $resetUrl }}" style="color:#006e2f; text-decoration:underline;">{{ $resetUrl }}</a>
    </p>
</div>
