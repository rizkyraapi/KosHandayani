@php
    $title = $title ?? 'Pengingat Masa Sewa';
    $preheader = $preheader ?? 'Informasi masa sewa Anda di KosHandayani.';
    $eyebrow = $eyebrow ?? 'Pengingat Sewa';
    $reminderMessage = $reminderMessage ?? 'masa sewa Anda akan segera berakhir.';
    $slot = view('emails.partials.lease-reminder-body', [
        'tenantName' => $tenantName,
        'roomName' => $roomName,
        'branchName' => $branchName,
        'endDate' => $endDate,
        'actionUrl' => $actionUrl,
        'daysLeft' => $daysLeft ?? null,
        'overdueDays' => $overdueDays ?? null,
        'tone' => $tone ?? 'upcoming',
        'reminderMessage' => $reminderMessage,
    ])->render();
@endphp

@extends('emails.layout')

@section('content')
    @include('emails.components.content', [
        'title' => $title,
        'intro' => 'Halo <strong style="color:#111c2d;">'.e($tenantName).'</strong>, '.$reminderMessage,
        'slot' => $slot,
    ])
@endsection
