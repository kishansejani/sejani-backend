<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\FarmCrop;
use App\Models\FarmExpense;
use App\Models\FarmProduction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FarmingController extends Controller
{
    /**
     * Get Farming Dashboard Summary (Revenue, Expense, Profit, Crops, Recent Sales)
     */
    public function getSummary(Request $request)
    {
        $userId = Auth::id();

        // 1. Productions & Revenue (Total Income from Crop Sales)
        $productions = FarmProduction::where('user_id', $userId)
            ->orderBy('sale_date', 'desc')
            ->get();

        $totalRevenue = (float)$productions->sum('total_amount');

        // 2. Farming Expenses (Total Farming Cost)
        $expenses = FarmExpense::where('user_id', $userId)
            ->orderBy('expense_date', 'desc')
            ->get();

        $totalExpense = (float)$expenses->sum('amount');

        // 3. Net Farming Profit
        $netProfit = $totalRevenue - $totalExpense;

        // 4. Farms & Crops
        $farms = Farm::where('user_id', $userId)->get();
        $crops = FarmCrop::where('user_id', $userId)->get();

        // 5. Expense breakdown by category
        $labourExpense = (float)$expenses->where('expense_type', 'labour')->sum('amount');
        $tractorExpense = (float)$expenses->where('expense_type', 'tractor')->sum('amount');
        $fertilizerExpense = (float)$expenses->where('expense_type', 'fertilizer')->sum('amount');
        $medicineExpense = (float)$expenses->where('expense_type', 'medicine')->sum('amount');
        $otherExpense = (float)$expenses->whereNotIn('expense_type', ['labour', 'tractor', 'fertilizer', 'medicine'])->sum('amount');

        return response()->json([
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_expense' => $totalExpense,
                'net_profit' => $netProfit,
                'total_farms' => $farms->count(),
                'total_crops' => $crops->count(),
                'total_productions_count' => $productions->count(),
                'breakdown' => [
                    'labour' => $labourExpense,
                    'tractor' => $tractorExpense,
                    'fertilizer' => $fertilizerExpense,
                    'medicine' => $medicineExpense,
                    'other' => $otherExpense,
                ],
            ],
            'productions' => $productions,
            'expenses' => $expenses,
            'farms' => $farms,
            'crops' => $crops,
        ]);
    }

    /**
     * Store Crop Production / Sale Record with Multi-unit Math
     */
    public function storeProduction(Request $request)
    {
        $validated = $request->validate([
            'crop_name_gu' => 'required|string',
            'quantity' => 'required|numeric|min:0.01',
            'unit' => 'required|string|in:khandi,man,kg,quintal,ton',
            'rate_per_unit' => 'required|numeric|min:0.01',
            'buyer_name' => 'nullable|string',
            'sale_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $quantity = (float)$validated['quantity'];
        $rate = (float)$validated['rate_per_unit'];
        $unit = $validated['unit'];

        // Automatic Math Calculation: Total Amount = Quantity * Rate
        $totalAmount = $quantity * $rate;

        // Calculate equivalents in 'મણ' (20 KG) and 'કિલો'
        $equivalentMan = 0;
        $equivalentKg = 0;

        switch ($unit) {
            case 'khandi': // 1 ખાંડી = 20 મણ = 400 KG
                $equivalentMan = $quantity * 20;
                $equivalentKg = $quantity * 400;
                break;
            case 'man': // 1 મણ = 20 KG
                $equivalentMan = $quantity;
                $equivalentKg = $quantity * 20;
                break;
            case 'quintal': // 1 ક્વિન્ટલ = 5 મણ = 100 KG
                $equivalentMan = $quantity * 5;
                $equivalentKg = $quantity * 100;
                break;
            case 'ton': // 1 ટન = 50 મણ = 1000 KG
                $equivalentMan = $quantity * 50;
                $equivalentKg = $quantity * 1000;
                break;
            case 'kg':
            default:
                $equivalentMan = $quantity / 20;
                $equivalentKg = $quantity;
                break;
        }

        // STRICT SECURITY: user_id = auth()->id()
        $production = FarmProduction::create([
            'user_id' => Auth::id(),
            'crop_name_gu' => $validated['crop_name_gu'],
            'quantity' => $quantity,
            'unit' => $unit,
            'rate_per_unit' => $rate,
            'total_amount' => $totalAmount,
            'equivalent_man' => $equivalentMan,
            'equivalent_kg' => $equivalentKg,
            'buyer_name' => $validated['buyer_name'] ?? null,
            'sale_date' => $validated['sale_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'પાક ઉત્પાદન અને વેચાણ હિસાબ સફળતાપૂર્વક સાચવવામાં આવ્યો.',
            'production' => $production,
        ], 201);
    }

    /**
     * Store Farming Expense (Labour, Tractor, Fertilizer, Medicine)
     */
    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'expense_type' => 'required|string|in:labour,tractor,fertilizer,medicine,seeds,diesel,other',
            'title_gu' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'quantity_or_hours' => 'nullable|numeric',
            'unit_rate' => 'nullable|numeric',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $expense = FarmExpense::create([
            'user_id' => Auth::id(),
            'expense_type' => $validated['expense_type'],
            'title_gu' => $validated['title_gu'],
            'amount' => (float)$validated['amount'],
            'quantity_or_hours' => isset($validated['quantity_or_hours']) ? (float)$validated['quantity_or_hours'] : null,
            'unit_rate' => isset($validated['unit_rate']) ? (float)$validated['unit_rate'] : null,
            'expense_date' => $validated['expense_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'ખેતી ખર્ચ સફળતાપૂર્વક ઉમેરાઈ ગયો.',
            'expense' => $expense,
        ], 201);
    }

    /**
     * Delete Production
     */
    public function deleteProduction(int $id)
    {
        $prod = FarmProduction::where('user_id', Auth::id())->findOrFail($id);
        $prod->delete();

        return response()->json([
            'message' => 'ઉત્પાદન રેકોર્ડ ડિલીટ કર્યો.',
        ]);
    }

    /**
     * Delete Expense
     */
    public function deleteExpense(int $id)
    {
        $exp = FarmExpense::where('user_id', Auth::id())->findOrFail($id);
        $exp->delete();

        return response()->json([
            'message' => 'ખેતી ખર્ચ રેકોર્ડ ડિલીટ કર્યો.',
        ]);
    }
}
