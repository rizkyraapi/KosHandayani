<?php

namespace App\Http\Controllers;

use App\Models\Branch;

class BranchController extends Controller
{
    public function index()
    {
        return response()->json(
            Branch::query()
                ->orderBy('branch_name')
                ->get()
                ->map(fn (Branch $branch) => [
                    'id' => $branch->id,
                    'branch_name' => $branch->branch_name,
                    'city' => $branch->city,
                    'address' => $branch->address,
                    'description' => $branch->description,
                ]),
        );
    }
}
