<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PersonalRecordResource;
use App\Models\AuditLog;
use App\Models\PersonalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class PersonalRecordController extends Controller
{
    /**
     * Display a listing of personal records for the authenticated user.
     */
    public function index(Request $request)
    {
        $type = $request->query('type');
        $search = $request->query('search');
        $category = $request->query('category');

        // BelongsToUser global scope ensures WHERE user_id = auth()->id()
        $query = PersonalRecord::where('user_id', Auth::id())
            ->orderBy('is_pinned', 'desc')
            ->orderBy('record_date', 'desc')
            ->orderBy('id', 'desc');

        if ($type) {
            $query->where('record_type', $type);
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $records = $query->paginate($request->query('per_page', 20));

        return PersonalRecordResource::collection($records);
    }

    /**
     * Store a newly created personal record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'record_type' => 'required|string|in:note,expense,document,reminder,diary',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'amount' => 'nullable|numeric',
            'category' => 'nullable|string|max:50',
            'record_date' => 'required|date',
            'is_pinned' => 'nullable|boolean',
            'is_locked' => 'nullable|boolean',
        ], [
            'title.required' => 'શીર્ષક દાખલ કરવું જરૂરી છે.',
            'record_date.required' => 'તારીખ દાખલ કરવી જરૂરી છે.',
        ]);

        // CRITICAL SECURITY: Never trust user_id from payload. Enforce auth()->id()
        $validated['user_id'] = Auth::id();
        $validated['is_pinned'] = $request->boolean('is_pinned', false);
        $validated['is_locked'] = $request->boolean('is_locked', false);

        $record = PersonalRecord::create($validated);

        return response()->json([
            'message' => 'રેકોર્ડ સફળતાપૂર્વક સાચવવામાં આવ્યો.',
            'record' => new PersonalRecordResource($record),
        ], 201);
    }

    /**
     * Display the specified personal record.
     */
    public function show(int $id)
    {
        // Find record without global scope to verify ownership and trigger 403 explicitly
        $record = PersonalRecord::withoutGlobalScopes()->findOrFail($id);

        // Authorize with Policy
        $response = Gate::inspect('view', $record);
        if ($response->denied()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'unauthorized_record_access',
                'details' => 'અન્ય યુઝરનો રેકોર્ડ ID: ' . $id . ' જોવાનો પ્રયાસ કર્યો.',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return response()->json([
                'message' => $response->message(),
            ], 403);
        }

        return response()->json([
            'record' => new PersonalRecordResource($record),
        ]);
    }

    /**
     * Update the specified personal record.
     */
    public function update(Request $request, int $id)
    {
        $record = PersonalRecord::withoutGlobalScopes()->findOrFail($id);

        // Authorize with Policy
        $response = Gate::inspect('update', $record);
        if ($response->denied()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'unauthorized_record_edit_attempt',
                'details' => 'અન્ય યુઝરનો રેકોર્ડ ID: ' . $id . ' એડિટ કરવાનો પ્રયાસ કર્યો.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'message' => $response->message(),
            ], 403);
        }

        $validated = $request->validate([
            'record_type' => 'sometimes|required|string|in:note,expense,document,reminder,diary',
            'title' => 'sometimes|required|string|max:255',
            'content' => 'nullable|string',
            'amount' => 'nullable|numeric',
            'category' => 'nullable|string|max:50',
            'record_date' => 'sometimes|required|date',
            'is_pinned' => 'nullable|boolean',
            'is_locked' => 'nullable|boolean',
        ]);

        // Never let user_id be updated
        unset($validated['user_id']);

        $record->update($validated);

        return response()->json([
            'message' => 'રેકોર્ડ સફળતાપૂર્વક અપડેટ થયો.',
            'record' => new PersonalRecordResource($record),
        ]);
    }

    /**
     * Remove the specified personal record.
     */
    public function destroy(int $id)
    {
        $record = PersonalRecord::withoutGlobalScopes()->findOrFail($id);

        // Authorize with Policy
        $response = Gate::inspect('delete', $record);
        if ($response->denied()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'unauthorized_record_delete_attempt',
                'details' => 'અન્ય યુઝરનો રેકોર્ડ ID: ' . $id . ' ડિલીટ કરવાનો પ્રયાસ કર્યો.',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return response()->json([
                'message' => $response->message(),
            ], 403);
        }

        $record->delete();

        return response()->json([
            'message' => 'રેકોર્ડ સફળતાપૂર્વક ડિલીટ કર્યો.',
        ]);
    }
}
