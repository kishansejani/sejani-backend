<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $tasks = Task::where('user_id', $userId)
            ->orderBy('task_date', 'asc')
            ->orderBy('task_time', 'asc')
            ->get();

        $pending = $tasks->where('is_completed', false)->values();
        $completed = $tasks->where('is_completed', true)->values();

        return response()->json([
            'tasks' => $tasks,
            'pending' => $pending,
            'completed' => $completed,
            'counts' => [
                'total' => $tasks->count(),
                'pending' => $pending->count(),
                'completed' => $completed->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'category' => 'required|string|in:payment_collect,bill_pay,farming_work,vehicle,general',
            'amount' => 'nullable|numeric',
            'task_date' => 'required|date',
            'task_time' => 'nullable|string',
            'reminder_datetime' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $task = Task::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'category' => $validated['category'],
            'amount' => $validated['amount'] ?? null,
            'task_date' => $validated['task_date'],
            'task_time' => $validated['task_time'] ?? '10:00 AM',
            'reminder_datetime' => $validated['reminder_datetime'] ?? null,
            'is_completed' => false,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'રિમાઇન્ડર / ટાસ્ક સફળતાપૂર્વક સાચવવામાં આવ્યું.',
            'task' => $task,
        ], 201);
    }

    public function toggleComplete(int $id)
    {
        $task = Task::where('user_id', Auth::id())->findOrFail($id);
        $task->is_completed = !$task->is_completed;
        $task->save();

        return response()->json([
            'message' => $task->is_completed ? 'કામ પૂર્ણ થઈ ગયું.' : 'કામ બાકી લિસ્ટમાં મૂક્યું.',
            'task' => $task,
        ]);
    }

    public function destroy(int $id)
    {
        $task = Task::where('user_id', Auth::id())->findOrFail($id);
        $task->delete();

        return response()->json([
            'message' => 'રિમાઇન્ડર ડિલીટ કર્યું.',
        ]);
    }
}
