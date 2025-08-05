<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Exception;

class UserImport implements ToCollection, WithHeadingRow, WithChunkReading, WithBatchInserts
{
    public $errors = [];
    private $rowCount = 0;
    private $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function collection(Collection $rows)
    {
        $this->rowCount += $rows->count();

        foreach ($rows as $index => $row) {
            $this->processRow($row, $index);
        }
    }

    private function processRow($row, $index)
    {
        $rowNumber = $index + 2;

        try {
            $validator = Validator::make($row->toArray(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'nullable|string|min:6',
                'department' => 'nullable|string',
                'manager' => 'nullable|string',
                'role' => 'required|string|exists:roles,name',
            ]);

            if ($validator->fails()) {
                foreach ($validator->errors()->all() as $error) {
                    $this->errors[] = [
                        'row' => $rowNumber,
                        'type' => 'validation',
                        'message' => $error,
                        'data' => $row->toArray()
                    ];
                }
                return;
            }

            $department = null;
            if (!empty($row['department'])) {
                $department = Department::where('name', trim($row['department']))->first();
                if (!$department) {
                    $this->errors[] = [
                        'row' => $rowNumber,
                        'type' => 'reference',
                        'message' => "Department '{$row['department']}' not found",
                        'data' => $row->toArray()
                    ];
                    return;
                }
            }

            $manager = null;
            if (!empty($row['manager'])) {
                $manager = User::where('name', trim($row['manager']))->first();
                if (!$manager) {
                    $this->errors[] = [
                        'row' => $rowNumber,
                        'type' => 'reference',
                        'message' => "Manager with name '{$row['manager']}' not found",
                        'data' => $row->toArray()
                    ];
                    return;
                }
            }

            $userData = [
                'name' => trim($row['name']),
                'email' => strtolower(trim($row['email'])),
                'password' => bcrypt(!empty($row['password']) ? $row['password'] : 'password'),
                'department_id' => $department?->id,
                'manager_id' => $manager?->id,
            ];

            $user = User::create($userData);
            $user->assignRole('employee');
            if ($row['role'] !== 'employee') {
                $user->assignRole($row['role']);
            }

            Log::debug("User created successfully", [
                'row' => $rowNumber,
                'email' => $userData['email']
            ]);

        } catch (Exception $e) {
            $this->errors[] = [
                'row' => $rowNumber,
                'type' => 'database',
                'message' => "Failed to create user: " . $e->getMessage(),
                'data' => $row->toArray()
            ];

            Log::error("Failed to create user", [
                'row' => $rowNumber,
                'error' => $e->getMessage(),
                'data' => $row->toArray()
            ]);
        }
    }

    public function getRowCount()
    {
        return $this->rowCount;
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function batchSize(): int
    {
        return 500;
    }
}