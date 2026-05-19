<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequireSiakadAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->session()->has('siakad_user_id')) {
            return redirect()->route('login');
        }

        return $next($request);
    }
}
