<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>{{ $title ?? 'KosHandayani' }}</title>
    <style>
        @media only screen and (max-width: 640px) {
            .email-shell { width: 100% !important; }
            .email-container { padding: 18px !important; }
            .email-card { border-radius: 18px !important; }
            .email-card-inner { padding: 28px 22px !important; }
            .email-title { font-size: 25px !important; line-height: 32px !important; }
            .email-button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .email-meta-grid td { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background:#f6f8f4; color:#111c2d; font-family:Inter, Arial, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
        {{ $preheader ?? 'Informasi resmi dari KosHandayani.' }}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f8f4; margin:0; padding:0;">
        <tr>
            <td align="center" class="email-container" style="padding:36px 20px;">
                <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="width:640px; max-width:640px;">
                    <tr>
                        <td>
                            @include('emails.components.header')
                            @yield('content')
                            @include('emails.components.footer')
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
