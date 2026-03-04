<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationDataEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $userId;

    public function __construct($message, $userId = null)
    {
        $this->message = $message;
        $this->userId = $userId;
        \Log::info('Event created', [
            'message' => $message,
            'userId' => $userId
        ]);
    }

    public function broadcastOn()
    {

        // For private user-specific notifications
        if ($this->userId) {
            \Log::info('Broadcasting on channel check', [
                'message' => $this->message,
                'userId' => $this->userId
            ]);
            return new PrivateChannel('user.' . $this->userId);
        }

        // For public notifications
        return new Channel('notifications');
    }

    // public function broadcastWith()
    // {
    //     return [
    //         'message' => $this->message,
    //         'timestamp' => now()->toISOString(),
    //     ];
    // }
}
