<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\WelcomeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class TestController extends Controller
{
    /**
     * Test email notificaton
     * @author Mamun Hossen
     */
    public function testEmailNotification()
    {
        $user =  User::first();
        $messages["hi"] = "Hey, Happy Birthday {$user->name}";
        $messages["wish"] = "On behalf of the entire company I wish you a very happy birthday and send you my best wishes for much happiness in your life.";
        $user->notify(new WelcomeNotification($messages));



        dd('done');
    }
}
