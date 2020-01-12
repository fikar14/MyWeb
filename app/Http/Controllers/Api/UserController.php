<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\User;
use Auth;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function login(Request $request){
      $credentials = $request->only('email', 'password');

      if(Auth::attempt($credentials)){
        $token = Str::random(80);
        Auth::user()->api_token = $token;
        Auth::user()->save();
        $admin = Auth::user()->isAdmin();
        return response()->json(['token' => $token, 'isAdmin' => $admin], 200);
      }
      return response()->json(['status'=> 'Password yang anda masukkan salah'], 403);
    }

    public function verify(Request $request){
      return $request->user()->only('name', 'email');
    }
}
