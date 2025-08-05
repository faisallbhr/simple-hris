<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ImportUsers implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $status;
    public $totalRows;
    public $message;
    public $errors;
    /**
     * Create a new event instance.
     */
    public function __construct($userId, $status, $totalRows, $message, $errors = [])
    {
        $this->userId = $userId;
        $this->status = $status;
        $this->totalRows = $totalRows;
        $this->message = $message;
        $this->errors = $errors;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastAs()
    {
        return 'import.users';
    }
}
