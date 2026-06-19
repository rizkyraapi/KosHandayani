@php
    $title = 'Verifikasi Akun KosHandayani';
    $preheader = 'Selesaikan verifikasi email untuk mengaktifkan akses penuh akun KosHandayani Anda.';
    $eyebrow = 'Verifikasi Akun';
    $slot = view('emails.partials.verification-body', [
        'verificationUrl' => $verificationUrl,
    ])->render();
@endphp

@extends('emails.layout')

@section('content')
    @include('emails.components.content', [
        'title' => $title,
        'intro' => 'Halo <strong style="color:#111c2d;">'.e($userName).'</strong>, selamat datang di KosHandayani.',
        'slot' => $slot,
    ])
@endsection
