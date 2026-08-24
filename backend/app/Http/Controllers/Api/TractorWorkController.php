<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TractorWork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TractorWorkController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $category = $request->query('category'); // 'customer' or 'self'
        $customer = $request->query('customer');

        $query = TractorWork::where('user_id', $userId)
            ->orderBy('work_date', 'desc')
            ->orderBy('id', 'desc');

        if ($category) {
            $query->where('work_category', $category);
        }

        if ($customer) {
            $query->where('customer_name', 'like', "%{$customer}%");
        }

        $works = $query->get();

        // Customer wise summary for quick billing
        $customersList = TractorWork::where('user_id', $userId)
            ->where('work_category', 'customer')
            ->whereNotNull('customer_name')
            ->select('customer_name')
            ->distinct()
            ->pluck('customer_name');

        $totalIncome = (float)TractorWork::where('user_id', $userId)
            ->where('work_category', 'customer')
            ->sum('total_amount');

        $totalSelfExpense = (float)TractorWork::where('user_id', $userId)
            ->where('work_category', 'self')
            ->sum('total_amount');

        return response()->json([
            'works' => $works,
            'customers' => $customersList,
            'totals' => [
                'total_customer_income' => $totalIncome,
                'total_self_expense' => $totalSelfExpense,
                'total_records' => $works->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'work_category' => 'required|string|in:customer,self',
            'customer_name' => 'nullable|string',
            'customer_phone' => 'nullable|string',
            'operation_type' => 'required|string', // દાંતી, રાંપ, માઢ, સાવડા, માંડવી પાડવા, રોટાવેટર...
            'trips_count' => 'required|integer|min:1',
            'calc_basis' => 'required|string|in:vigha,hours,trips',
            'units_count' => 'required|numeric|min:0.01',
            'rate_per_unit' => 'required|numeric|min:0.01',
            'payment_status' => 'nullable|string|in:paid,pending,partial',
            'paid_amount' => 'nullable|numeric',
            'work_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $trips = (int)$validated['trips_count'];
        $units = (float)$validated['units_count'];
        $rate = (float)$validated['rate_per_unit'];

        // Automatic Math Calculation: (ફેરા × વીઘા/કલાક × ભાવ)
        $totalAmount = $trips * $units * $rate;

        $work = TractorWork::create([
            'user_id' => Auth::id(),
            'work_category' => $validated['work_category'],
            'customer_name' => $validated['customer_name'] ?? ($validated['work_category'] === 'self' ? 'મારું ખેતર' : 'ગ્રાહક'),
            'customer_phone' => $validated['customer_phone'] ?? null,
            'operation_type' => $validated['operation_type'],
            'trips_count' => $trips,
            'calc_basis' => $validated['calc_basis'],
            'units_count' => $units,
            'rate_per_unit' => $rate,
            'total_amount' => $totalAmount,
            'payment_status' => $validated['payment_status'] ?? 'pending',
            'paid_amount' => $validated['paid_amount'] ?? 0,
            'work_date' => $validated['work_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'ટ્રેક્ટર કામનો હિસાબ સફળતાપૂર્વક સાચવવામાં આવ્યો.',
            'work' => $work,
        ], 201);
    }

    public function destroy(int $id)
    {
        $work = TractorWork::where('user_id', Auth::id())->findOrFail($id);
        $work->delete();

        return response()->json([
            'message' => 'ટ્રેક્ટર હિસાબ રેકોર્ડ ડિલીટ કર્યો.',
        ]);
    }
}
