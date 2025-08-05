<?php

namespace App\Jobs;

use App\Events\ImportUsers;
use App\Imports\UserImport;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Exception;

class ImportUsersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $filePath;
    protected $userId;

    public function __construct($filePath, $userId)
    {
        $this->filePath = $filePath;
        $this->userId = $userId;
    }

    public function handle()
    {
        $import = null;

        try {
            if (!Storage::disk('public')->exists($this->filePath)) {
                throw new Exception("Import file not found: {$this->filePath}");
            }

            DB::beginTransaction();

            $import = new UserImport($this->userId);
            Excel::import($import, Storage::disk('public')->path($this->filePath));

            if (!empty($import->errors)) {
                DB::rollBack();

                Log::warning('Import failed due to validation errors', [
                    'file' => $this->filePath,
                    'errors_count' => count($import->errors),
                    'errors' => array_slice($import->errors, 0, 10)
                ]);

                broadcast(new ImportUsers(
                    $this->userId,
                    'failed',
                    $this->filePath,
                    'Import failed due to validation errors',
                    $import->errors
                ));

                return;
            }

            DB::commit();

            Log::info('Import completed successfully', [
                'file' => $this->filePath,
                'rows_processed' => $import->getRowCount(),
            ]);

            broadcast(new ImportUsers(
                $this->userId,
                'success',
                $import->getRowCount(),
                'Import completed successfully',
                []
            ));
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Import job failed with exception', [
                'file' => $this->filePath,
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            broadcast(new ImportUsers(
                $this->userId,
                'failed',
                $this->filePath,
                $e->getMessage(),
                $import ? $import->errors : []
            ));
        } finally {
            $this->cleanupFile();
        }
    }

    /**
     * Clean up uploaded file
     */
    private function cleanupFile()
    {
        try {
            if (Storage::disk('public')->exists($this->filePath)) {
                Storage::disk('public')->delete($this->filePath);
                Log::info("Cleaned up import file: {$this->filePath}");
            }
        } catch (Exception $e) {
            Log::warning("Failed to cleanup import file: {$this->filePath}", [
                'error' => $e->getMessage()
            ]);
        }
    }
}