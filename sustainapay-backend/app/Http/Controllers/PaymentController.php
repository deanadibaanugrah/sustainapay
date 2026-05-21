<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function callback(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

        // Verifikasi apakah ini benar-benar kiriman dari Midtrans
        if ($hashed == $request->signature_key) {
            if ($request->transaction_status == 'capture' || $request->transaction_status == 'settlement') {
                
                // Asumsi: Jika order_id membawa ID User. Jika order_id beda format, sesuaikan logic pencariannya.
                $user = User::find($request->order_id); 
                
                if ($user) {
                    // PERBAIKAN: Ubah balance menjadi wallet_balance
                    $user->wallet_balance += $request->gross_amount; 
                    $user->save();
                }

                return response()->json(['message' => 'Success']);
            }
        }
        
        return response()->json(['message' => 'Invalid Signature'], 403);
    }
}