<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApplyRememberedSessionLifetime
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->cookie('kh_remember_me') === '1') {
            config(['session.lifetime' => 60 * 24 * 30]);
        }

        return $next($request);
    }
}
