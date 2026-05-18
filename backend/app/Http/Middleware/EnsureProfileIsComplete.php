<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileIsComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'tenant' || ! $user->isProfileComplete()) {
            return response()->json([
                'message' => 'Lengkapi profil terlebih dahulu',
            ], 403);
        }

        return $next($request);
    }
}
