<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan Kos Handayani</title>
    <style>
        @page {
            margin: 30px 32px 54px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #111c2d;
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            line-height: 1.4;
        }

        .header {
            border-bottom: 3px solid #006e2f;
            padding-bottom: 14px;
            margin-bottom: 16px;
        }

        .header-table,
        .summary-table,
        .meta-table {
            width: 100%;
            border-collapse: collapse;
        }

        .logo {
            width: 105px;
            height: auto;
        }

        .report-title {
            margin: 0;
            color: #005321;
            font-size: 19px;
            font-weight: 800;
            letter-spacing: .3px;
            text-align: right;
        }

        .report-subtitle {
            margin-top: 4px;
            color: #657166;
            font-size: 8px;
            text-align: right;
        }

        .meta-table {
            margin-bottom: 18px;
            background: #f0f8f3;
            border: 1px solid #d6eadc;
            border-radius: 8px;
        }

        .meta-table td {
            width: 33.33%;
            padding: 9px 11px;
            border-right: 1px solid #d6eadc;
        }

        .meta-table td:last-child {
            border-right: 0;
        }

        .meta-label,
        .card-label {
            color: #5b685d;
            font-size: 7px;
            font-weight: 700;
            letter-spacing: .7px;
            text-transform: uppercase;
        }

        .meta-value {
            margin-top: 3px;
            color: #111c2d;
            font-size: 9px;
            font-weight: 700;
        }

        .section {
            margin-top: 16px;
        }

        .payment-section {
            page-break-before: always;
        }

        .expense-detail-section {
            page-break-before: always;
        }

        .section-title {
            margin: 0 0 8px;
            padding-left: 8px;
            border-left: 4px solid #006e2f;
            color: #111c2d;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: .4px;
        }

        .summary-table {
            table-layout: fixed;
        }

        .summary-table td {
            padding: 10px;
            vertical-align: top;
            background: #f9f9ff;
            border: 4px solid #ffffff;
            outline: 1px solid #e0e8e2;
        }

        .summary-table + .summary-table {
            margin-top: 6px;
        }

        .payment-list {
            width: 100%;
            border-collapse: collapse;
        }

        .payment-list td {
            padding: 7px 9px;
            border: 1px solid #dfe6e0;
        }

        .payment-list tr:nth-child(even) td {
            background: #f5f8f6;
        }

        .payment-list .payment-count {
            width: 25%;
            color: #006e2f;
            font-size: 11px;
            font-weight: 800;
            text-align: right;
        }

        .summary-value {
            margin-top: 5px;
            color: #006e2f;
            font-size: 13px;
            font-weight: 800;
        }

        .summary-value.dark {
            color: #111c2d;
        }

        .transaction-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .transaction-table thead {
            display: table-header-group;
        }

        .transaction-table tr {
            page-break-inside: avoid;
        }

        .transaction-table th {
            padding: 7px 5px;
            color: #ffffff;
            background: #006e2f;
            border: 1px solid #005321;
            font-size: 7px;
            letter-spacing: .35px;
            text-align: left;
            text-transform: uppercase;
        }

        .transaction-table td {
            padding: 7px 5px;
            border: 1px solid #dfe6e0;
            font-size: 7.5px;
            vertical-align: top;
            word-wrap: break-word;
        }

        .transaction-table tbody tr:nth-child(even) td {
            background: #f5f8f6;
        }

        .amount {
            color: #005321;
            font-weight: 700;
            text-align: right;
            white-space: nowrap;
        }

        .status {
            font-weight: 700;
        }

        .status-paid {
            color: #006e2f;
        }

        .status-pending {
            color: #a16207;
        }

        .status-failed {
            color: #b91c1c;
        }

        .empty {
            padding: 18px;
            color: #657166;
            background: #f9f9ff;
            border: 1px dashed #b9c7bc;
            border-radius: 7px;
            text-align: center;
        }

        .footer {
            position: fixed;
            right: 0;
            bottom: -36px;
            left: 0;
            padding-top: 8px;
            color: #667168;
            border-top: 1px solid #dfe6e0;
            font-size: 7px;
        }

        .footer-left {
            float: left;
        }

        .footer-right {
            float: right;
        }
    </style>
</head>
<body>
    @php
        $export = $report['export'];
        $rupiah = static fn (int $value): string => 'Rp '.number_format($value, 0, ',', '.');
    @endphp

    <footer class="footer">
        <span class="footer-left">KosHandayani · Laporan keuangan internal</span>
        <span class="footer-right">Dicetak {{ $export['meta']['printed_at'] }}</span>
    </footer>

    <header class="header">
        <table class="header-table">
            <tr>
                <td>
                    @if ($logoDataUri)
                        <img class="logo" src="{{ $logoDataUri }}" alt="KosHandayani">
                    @else
                        <strong style="color: #006e2f; font-size: 16px;">KosHandayani</strong>
                    @endif
                </td>
                <td>
                    <h1 class="report-title">LAPORAN KEUANGAN KOS HANDAYANI</h1>
                    <div class="report-subtitle">Ringkasan analytics dan detail transaksi owner</div>
                </td>
            </tr>
        </table>
    </header>

    <table class="meta-table">
        <tr>
            <td>
                <div class="meta-label">Periode</div>
                <div class="meta-value">{{ $export['meta']['period_label'] }}</div>
            </td>
            <td>
                <div class="meta-label">Cabang</div>
                <div class="meta-value">{{ $export['meta']['branch_label'] }}</div>
            </td>
            <td>
                <div class="meta-label">Tanggal Cetak</div>
                <div class="meta-value">{{ $export['meta']['printed_at'] }}</div>
            </td>
        </tr>
    </table>

    <section class="section">
        <h2 class="section-title">1. RINGKASAN KEUANGAN</h2>
        <table class="summary-table">
            <tr>
                <td>
                    <div class="card-label">Total Pemasukan</div>
                    <div class="summary-value">{{ $rupiah($export['financial_summary']['total_income']) }}</div>
                </td>
                <td>
                    <div class="card-label">Total Pengeluaran</div>
                    <div class="summary-value dark">{{ $rupiah($export['financial_summary']['total_expenses']) }}</div>
                </td>
                <td>
                    <div class="card-label">Laba Bersih</div>
                    <div class="summary-value">{{ $rupiah($export['financial_summary']['net_balance']) }}</div>
                </td>
            </tr>
        </table>
    </section>

    <section class="section">
        <h2 class="section-title">2. RINGKASAN PENGELUARAN</h2>
        @if (count($export['expense_by_category']) === 0)
            <div class="empty">Tidak ada pengeluaran pada periode dan cabang yang dipilih.</div>
        @else
            <table class="payment-list">
                @foreach ($export['expense_by_category'] as $category)
                    <tr>
                        <td>{{ $category['category'] }} ({{ $category['transactions'] }} transaksi)</td>
                        <td class="payment-count">{{ $rupiah($category['amount']) }}</td>
                    </tr>
                @endforeach
            </table>
        @endif
    </section>

    <section class="section">
        <h2 class="section-title">3. PENGELUARAN PER CABANG</h2>
        <table class="payment-list">
            @foreach ($export['expense_by_branch'] as $branch)
                <tr>
                    <td>{{ $branch['branch_name'] }} ({{ $branch['transactions'] }} transaksi)</td>
                    <td class="payment-count">{{ $rupiah($branch['amount']) }}</td>
                </tr>
            @endforeach
        </table>
    </section>

    <section class="section">
        <h2 class="section-title">4. STATISTIK PROPERTI</h2>
        <table class="summary-table">
            <tr>
                <td>
                    <div class="card-label">Total Kamar</div>
                    <div class="summary-value dark">{{ $export['property_summary']['total_rooms'] }}</div>
                </td>
                <td>
                    <div class="card-label">Kamar Terisi</div>
                    <div class="summary-value dark">{{ $export['property_summary']['occupied_rooms'] }}</div>
                </td>
            </tr>
        </table>
        <table class="summary-table">
            <tr>
                <td>
                    <div class="card-label">Kamar Kosong</div>
                    <div class="summary-value dark">{{ $export['property_summary']['vacant_rooms'] }}</div>
                </td>
                <td>
                    <div class="card-label">Tingkat Hunian</div>
                    <div class="summary-value">{{ $export['property_summary']['occupancy_rate'] }}%</div>
                </td>
            </tr>
        </table>
    </section>

    <section class="section payment-section">
        <h2 class="section-title">5. RINGKASAN PEMBAYARAN</h2>
        <table class="payment-list">
            <tr>
                <td>Pembayaran Awal</td>
                <td class="payment-count">{{ $export['payment_summary']['initial_count'] }}</td>
            </tr>
            <tr>
                <td>Perpanjangan</td>
                <td class="payment-count">{{ $export['payment_summary']['renewal_count'] }}</td>
            </tr>
            <tr>
                <td>Berhasil</td>
                <td class="payment-count">{{ $export['payment_summary']['successful_count'] }}</td>
            </tr>
            <tr>
                <td>Pending</td>
                <td class="payment-count">{{ $export['payment_summary']['pending_count'] }}</td>
            </tr>
            <tr>
                <td>Gagal</td>
                <td class="payment-count">{{ $export['payment_summary']['failed_count'] }}</td>
            </tr>
        </table>
    </section>

    <section class="section transactions">
        <h2 class="section-title">6. DETAIL TRANSAKSI</h2>

        @if (count($export['transactions']) === 0)
            <div class="empty">Tidak ada transaksi pada periode dan cabang yang dipilih.</div>
        @else
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th style="width: 10%;">Tanggal</th>
                        <th style="width: 16%;">Penyewa</th>
                        <th style="width: 13%;">Kamar</th>
                        <th style="width: 12%;">Cabang</th>
                        <th style="width: 17%;">Jenis Pembayaran</th>
                        <th style="width: 18%; text-align: right;">Nominal</th>
                        <th style="width: 14%;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($export['transactions'] as $transaction)
                        @php
                            $statusClass = $transaction['status'] === 'Lunas'
                                ? 'status-paid'
                                : ($transaction['status'] === 'Gagal' ? 'status-failed' : 'status-pending');
                        @endphp
                        <tr>
                            <td>{{ $transaction['date'] ?: '-' }}</td>
                            <td>{{ $transaction['tenant_name'] }}</td>
                            <td>{{ $transaction['room_name'] }}</td>
                            <td>{{ $transaction['branch_name'] }}</td>
                            <td>{{ $transaction['payment_type'] }}</td>
                            <td class="amount">{{ $rupiah($transaction['amount']) }}</td>
                            <td class="status {{ $statusClass }}">{{ $transaction['status'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </section>

    <section class="section expense-detail-section">
        <h2 class="section-title">7. DETAIL PENGELUARAN</h2>

        @if (count($export['expenses']) === 0)
            <div class="empty">Tidak ada pengeluaran pada periode dan cabang yang dipilih.</div>
        @else
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th style="width: 12%;">Tanggal</th>
                        <th style="width: 17%;">Cabang</th>
                        <th style="width: 16%;">Kategori</th>
                        <th style="width: 31%;">Deskripsi</th>
                        <th style="width: 17%; text-align: right;">Nominal</th>
                        <th style="width: 7%;">Bukti</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($export['expenses'] as $expense)
                        <tr>
                            <td>{{ $expense['date'] }}</td>
                            <td>{{ $expense['branch_name'] }}</td>
                            <td>{{ $expense['category'] }}</td>
                            <td>{{ $expense['description'] }}</td>
                            <td class="amount">{{ $rupiah($expense['amount']) }}</td>
                            <td>{{ $expense['receipt'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </section>

    <script type="text/php">
        if (isset($pdf)) {
            $font = $fontMetrics->getFont("DejaVu Sans", "normal");
            $pdf->page_text(470, 816, "Halaman {PAGE_NUM} dari {PAGE_COUNT}", $font, 7, array(0.40, 0.44, 0.41));
        }
    </script>
</body>
</html>
