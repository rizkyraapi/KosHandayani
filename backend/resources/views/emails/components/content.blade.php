<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="background:#ffffff; border:1px solid #dfe8dc; border-radius:24px; box-shadow:0 18px 45px rgba(17,28,45,.08); overflow:hidden;">
    <tr>
        <td style="height:8px; background:linear-gradient(90deg, #006e2f 0%, #22c55e 100%); line-height:8px; font-size:0;">&nbsp;</td>
    </tr>
    <tr>
        <td class="email-card-inner" style="padding:38px 40px 40px;">
            @isset($title)
                <h1 class="email-title" style="margin:0; color:#111c2d; font-family:Manrope, Inter, Arial, sans-serif; font-size:30px; line-height:38px; font-weight:900; letter-spacing:0;">
                    {{ $title }}
                </h1>
            @endisset

            @isset($intro)
                <p style="margin:14px 0 0; color:#3d4a3d; font-size:16px; line-height:26px; font-weight:500;">
                    {!! $intro !!}
                </p>
            @endisset

            @isset($slot)
                <div style="margin-top:26px;">
                    {!! $slot !!}
                </div>
            @endisset
        </td>
    </tr>
</table>
