<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    \Log::info('Channel auth check', [
        'user_id' => $user,
        'channel_id' => $id,

    ]);
    return (int) $user->id === (int) $id;
});
