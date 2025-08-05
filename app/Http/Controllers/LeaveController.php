<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function index()
    {
        // Logic to display a list of leaves
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:sick,vacation,personal,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:1000',
        ]);

        Leave::create([
            'user_id' => auth()->id(),
            'type' => $data['type'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => $data['reason'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Leave request submitted successfully.');
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'type' => 'required|in:sick,vacation,personal,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:1000',
        ]);

        $leave = Leave::findOrFail($id);
        if ($leave->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending leave requests can be updated.');
        }

        if ($leave->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'You can only update your own leave requests.');
        }

        $leave->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);
        return redirect()->back()->with('success', 'Leave request updated successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string|max:1000',
        ]);

        $leave = Leave::findOrFail($id);
        if ($leave->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending leave requests can be updated.');
        }

        $leave->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Leave request status updated successfully.');
    }

    public function destroy($id)
    {
        $leave = Leave::findOrFail($id);
        if ($leave->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending leave requests can be deleted.');
        }

        $leave->delete();
        return redirect()->back()->with('success', 'Leave request deleted successfully.');
    }
}
