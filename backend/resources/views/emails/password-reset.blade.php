@php
    $title = 'Reset Kata Sandi';
    $preheader = 'Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.';
    $eyebrow = 'Keamanan Akun';
@endphp

@extends('emails.layout')

@section('content')
    @include('emails.components.content', [
        'title' => 'Reset Kata Sandi',
        'intro' => 'Halo <strong style="color:#111c2d;">'.e($userName).'</strong>, kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.',
        'slot' => view('emails.partials.password-reset-body', [
            'resetUrl' => $resetUrl,
        ])->render(),
    ])
@endsection
