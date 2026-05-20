<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Registrasi User Baru
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        /** @var \App\Models\User $user */
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'wallet_balance' => 0 // Saldo awal 0
        ]);

        return response()->json([
            'message' => 'User berhasil didaftarkan',
            'token' => $user->createToken('auth_token')->plainTextToken
        ]);
    }

    /**
     * Login User
     */
    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Email atau Password salah'], 401);
        }

        /** @var \App\Models\User $user */
        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login Berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout & Hapus Token
     */
    public function logout()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        // Menghapus token agar tidak bisa digunakan lagi
        $user->tokens()->delete();

        return response()->json(['message' => 'Berhasil Logout']);
    }
}