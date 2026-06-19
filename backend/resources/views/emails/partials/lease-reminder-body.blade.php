<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-meta-grid" style="margin:0; border-collapse:separate; border-spacing:0 10px;">
    <tr>
        <td width="50%" style="padding:14px 16px; background:#f7faf5; border:1px solid #e0eadf; border-radius:14px;">
            <p style="margin:0 0 5px; color:#667366; font-size:12px; line-height:16px; font-weight:700;">Nama Penyewa</p>
            <p style="margin:0; color:#111c2d; font-size:15px; line-height:21px; font-weight:800;">{{ $tenantName }}</p>
        </td>
        <td width="50%" style="padding:14px 16px; background:#f7faf5; border:1px solid #e0eadf; border-radius:14px;">
            <p style="margin:0 0 5px; color:#667366; font-size:12px; line-height:16px; font-weight:700;">Nama Kamar</p>
            <p style="margin:0; color:#111c2d; font-size:15px; line-height:21px; font-weight:800;">{{ $roomName }}</p>
        </td>
    </tr>
    <tr>
        <td width="50%" style="padding:14px 16px; background:#f7faf5; border:1px solid #e0eadf; border-radius:14px;">
            <p style="margin:0 0 5px; color:#667366; font-size:12px; line-height:16px; font-weight:700;">Cabang</p>
            <p style="margin:0; color:#111c2d; font-size:15px; line-height:21px; font-weight:800;">{{ $branchName }}</p>
        </td>
        <td width="50%" style="padding:14px 16px; background:#f7faf5; border:1px solid #e0eadf; border-radius:14px;">
            <p style="margin:0 0 5px; color:#667366; font-size:12px; line-height:16px; font-weight:700;">Tanggal Berakhir</p>
            <p style="margin:0; color:#111c2d; font-size:15px; line-height:21px; font-weight:800;">{{ $endDate }}</p>
        </td>
    </tr>
</table>

@if (! is_null($overdueDays))
    <div style="margin-top:18px; padding:16px 18px; border-radius:16px; background:#fff4ed; border:1px solid #fed7aa;">
        <p style="margin:0; color:#9a3412; font-size:14px; line-height:22px; font-weight:800;">
            Masa sewa terlambat {{ $overdueDays }} hari. Silakan lakukan perpanjangan atau hubungi pengelola.
        </p>
    </div>
@elseif (! is_null($daysLeft))
    <div style="margin-top:18px; padding:16px 18px; border-radius:16px; background:#e7f8eb; border:1px solid #b9edc5;">
        <p style="margin:0; color:#006e2f; font-size:14px; line-height:22px; font-weight:800;">
            Sisa waktu sewa: {{ $daysLeft }} hari.
        </p>
    </div>
@endif

@include('emails.components.cta-button', [
    'url' => $actionUrl,
    'label' => 'Perpanjang Sewa',
])

<p style="margin:26px 0 0; color:#536253; font-size:13px; line-height:21px;">
    Jika Anda sudah menghubungi pengelola, abaikan email ini. Kami tetap menyarankan konfirmasi status sewa melalui aplikasi KosHandayani.
</p>
