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
        $existingUser = User::withTrashed()->where('email', $request->email)->first();
        
        if ($existingUser && $existingUser->trashed()) {
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan/dihapus oleh Admin',
                'errors' => ['email' => ['Email ini telah diblokir.']]
            ], 403);
        }

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        /** @var \App\Models\User $user */
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // Disimpan plain text
            'wallet_balance' => 0 // Saldo awal 0
        ]);

        return response()->json([
            'message' => 'User berhasil didaftarkan',
            'token' => $user->createToken('auth_token')->plainTextToken
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        /** @var \App\Models\User $user */
        $user = User::withTrashed()->where('email', $request->email)->first();

        if ($user && $user->trashed()) {
            return response()->json(['message' => 'Akun Anda telah dinonaktifkan/dihapus oleh Admin'], 403);
        }

        // Check password manually since we are using plain text
        if (!$user || $user->password !== $request->password) {
            return response()->json(['message' => 'Email atau Password salah'], 401);
        }
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login Berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Update Profil User (Nama, Lokasi, Avatar)
     */
    public function update(Request $request)
    {
        // 1. Tangkap user spesifik dengan sanctum
        $user = auth('sanctum')->user();

        // 2. Jika token tidak ada / user tidak ditemukan, tolak
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak! Token tidak valid.'
            ], 401);
        }

        // 3. Validasi untuk nama dan lokasi saja
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        // 4. Update data nama dan lokasi
        $user->name = $request->name;
        $user->location = $request->location;

        // 5. Tangkap avatar Base64 dari React
        if ($request->has('avatar')) {
            if (is_string($request->avatar)) {
                $user->avatar = $request->avatar;
            }
        }

        // 6. Simpan ke database
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui!',
            'user' => $user
        ], 200);
    }

    /**
     * Logout & Hapus Token
     */
    public function logout(Request $request)
    {
        // Menggunakan request()->user() agar Sanctum mendeteksi token secara akurat
        $user = $request->user();
        
        if ($user) {
            // Menghapus token yang sedang digunakan saat ini saja
            $user->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Berhasil Logout']);
    }

    /**
     * Login / Register with Google
     */
    public function googleLogin(Request $request)
    {
        $request->validate([
            'token' => 'required|string'
        ]);

        try {
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->get('https://www.googleapis.com/oauth2/v3/userinfo', [
                    'access_token' => $request->token
                ]);

            if ($response->failed()) {
                return response()->json(['message' => 'Invalid Google token'], 401);
            }

            $payload = $response->json();
            $googleId = $payload['sub'];
            $email = $payload['email'] ?? null;
            $name = $payload['name'] ?? 'Google User';
            $avatar = $payload['picture'] ?? null;

            if (!$email) {
                return response()->json(['message' => 'Email not provided by Google'], 400);
            }

            /** @var \App\Models\User $user */
            $user = User::withTrashed()->where('email', $email)->first();

            if ($user && $user->trashed()) {
                return response()->json(['message' => 'Akun Anda telah dinonaktifkan/dihapus oleh Admin'], 403);
            }

            if ($user) {
                // Update google_id if not set
                if (!$user->google_id) {
                    $user->google_id = $googleId;
                }
                if (!$user->avatar && $avatar) {
                    $user->avatar = $avatar;
                }
                $user->save();
            } else {
                // Create new user
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => \Illuminate\Support\Str::random(24), // Disimpan plain text
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'wallet_balance' => 0
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Google Login Berhasil',
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Google login failed: ' . $e->getMessage()], 500);
        }
    }
}