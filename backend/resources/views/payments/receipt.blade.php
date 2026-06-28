<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Bukti Pembayaran KosHandayani</title>
    <style>
        @page {
            margin: 34px 36px 48px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #111c2d;
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            line-height: 1.45;
        }

        .header {
            border-bottom: 3px solid #006e2f;
            padding-bottom: 16px;
            margin-bottom: 20px;
        }

        .header-table,
        .info-table,
        .amount-table {
            width: 100%;
            border-collapse: collapse;
        }

        .logo {
            width: 118px;
            height: auto;
        }

        .title {
            margin: 0;
            color: #005321;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: .2px;
            text-align: right;
        }

        .subtitle {
            margin-top: 5px;
            color: #657166;
            font-size: 9px;
            text-align: right;
        }

        .status-card {
            margin-bottom: 18px;
            padding: 12px 14px;
            background: #eefdf2;
            border: 1px solid #ccefd6;
            border-radius: 10px;
        }

        .status-label {
            color: #346e40;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: .8px;
            text-transform: uppercase;
        }

        .status-value {
            margin-top: 4px;
            color: #005321;
            font-size: 14px;
            font-weight: 800;
        }

        .section {
            margin-top: 16px;
        }

        .section-title {
            margin: 0 0 8px;
            padding-left: 8px;
            border-left: 4px solid #006e2f;
            color: #111c2d;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: .3px;
        }

        .info-table {
            border: 1px solid #dfe6e0;
        }

        .info-table td {
            width: 50%;
            padding: 9px 11px;
            border: 1px solid #dfe6e0;
            vertical-align: top;
        }

        .label {
            display: block;
            color: #5b685d;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: .6px;
            text-transform: uppercase;
        }

        .value {
            display: block;
            margin-top: 3px;
            color: #111c2d;
            font-size: 10px;
            font-weight: 700;
        }

        .amount-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #dfe6e0;
        }

        .amount-table tr:last-child td {
            border-bottom: 0;
        }

        .amount-table .amount-label {
            color: #5b685d;
            font-weight: 700;
        }

        .amount-table .amount-value {
            color: #111c2d;
            font-size: 11px;
            font-weight: 800;
            text-align: right;
        }

        .amount-table .total-row td {
            background: #f0f8f3;
            color: #005321;
            font-size: 13px;
            font-weight: 900;
        }

        .footer {
            margin-top: 28px;
            padding-top: 12px;
            border-top: 1px solid #dfe6e0;
            color: #657166;
            font-size: 8px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    @if ($logoDataUri)
                        <img class="logo" src="{{ $logoDataUri }}" alt="KosHandayani">
                    @else
                        <strong>KosHandayani</strong>
                    @endif
                </td>
                <td>
                    <h1 class="title">Bukti Pembayaran</h1>
                    <div class="subtitle">Dokumen pembayaran resmi KosHandayani</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="status-card">
        <div class="status-label">Status Pembayaran</div>
        <div class="status-value">{{ $receipt['status'] }}</div>
    </div>

    <div class="section">
        <h2 class="section-title">Transaksi</h2>
        <table class="info-table">
            <tr>
                <td><span class="label">ID Transaksi</span><span class="value">{{ $receipt['transaction_id'] }}</span></td>
                <td><span class="label">Order ID</span><span class="value">{{ $receipt['order_id'] }}</span></td>
            </tr>
            <tr>
                <td><span class="label">Jenis Pembayaran</span><span class="value">{{ $receipt['payment_category'] }}</span></td>
                <td><span class="label">Metode Pembayaran</span><span class="value">{{ $receipt['payment_type'] }}</span></td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Penyewa</h2>
        <table class="info-table">
            <tr>
                <td><span class="label">Nama</span><span class="value">{{ $receipt['tenant_name'] }}</span></td>
                <td><span class="label">Email</span><span class="value">{{ $receipt['tenant_email'] }}</span></td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Properti</h2>
        <table class="info-table">
            <tr>
                <td><span class="label">Cabang</span><span class="value">{{ $receipt['branch_name'] }}</span></td>
                <td><span class="label">Nama Kamar</span><span class="value">{{ $receipt['room_name'] }}</span></td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Masa Sewa</h2>
        <table class="info-table">
            <tr>
                <td><span class="label">Periode Awal</span><span class="value">{{ $receipt['period_start'] }}</span></td>
                <td><span class="label">Periode Akhir</span><span class="value">{{ $receipt['period_end'] }}</span></td>
            </tr>
            <tr>
                <td colspan="2"><span class="label">Durasi</span><span class="value">{{ $receipt['duration'] }}</span></td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Pembayaran</h2>
        <table class="amount-table">
            <tr>
                <td class="amount-label">Subtotal</td>
                <td class="amount-value">{{ $receipt['subtotal_amount'] }}</td>
            </tr>
            <tr>
                <td class="amount-label">Diskon</td>
                <td class="amount-value">{{ $receipt['discount_amount'] }}</td>
            </tr>
            <tr class="total-row">
                <td>Total Dibayar</td>
                <td class="amount-value">{{ $receipt['gross_amount'] }}</td>
            </tr>
            <tr>
                <td class="amount-label">Tanggal Pembayaran</td>
                <td class="amount-value">{{ $receipt['paid_at'] }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Dokumen ini dibuat otomatis oleh KosHandayani.<br>
        Generated at: {{ $receipt['generated_at'] }}
    </div>
</body>
</html>
