<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Test\TestController;
use App\Http\Controllers\Tenant\AuthController;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Tenant\GoogleController;

## Pure backend routes for where vendor will set features
Route::prefix('admin')->middleware(['web'])->name('admin.')->group(function () {
    require __DIR__ . '/admin.php';
});

## Tenant/Customer web routes
Route::name('tenant.')->group(function () {

    Route::get('/register', [AuthController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [AuthController::class, 'processRegistrationForm'])->name('register.process');
    // Route::post('/register/process', [AuthController::class, 'processRegistrationForm'])->name('register.process');
    Route::get('/register/verify/{type?}/{email?}', [AuthController::class, 'showRegistrationVerifyForm'])
        ->name('register.verify');

    Route::post('/register/new/tenant', [AuthController::class, 'registerNewTenant'])->name('register.new.tenant');
    Route::post('/register/verify/process', [AuthController::class, 'registrationVerifyProcess'])->name('register.verify.process');

    Route::post('/user/verify/process', [AuthController::class, 'userVerifyProcess'])->name('user.verify.process');
    Route::get('/user/verify', [AuthController::class, 'showUserVerifyForm'])->name('user.verify');

    Route::post('/verify/token/resend', [AuthController::class, 'resendVerifyToken'])->name('resend.verify.token');

    Route::get('/test-email-notification', [TestController::class, 'testEmailNotification'])->name('test.email.notification');

    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login/process', [AuthController::class, 'loginProcess'])->name('login.process');
    Route::get('/auth/data', [AuthController::class, 'authData'])->name('auth.data');

    Route::get('/forget/password', [AuthController::class, 'showForgetPasswordForm'])->name('forget.password');
    Route::post('/forget/password/email-validate', [AuthController::class, 'emailValidationAndSendForPasswordReset'])->name('forget.password.email.validate');
    Route::get('/set/new/password/{email}', [AuthController::class, 'setNewPasswordForm'])->name('set.new.password');
    Route::post('/set/new/password/process', [AuthController::class, 'setNewPasswordProcess'])->name('set.new.password.process');
});

## Social AUTH routes
Route::controller(GoogleController::class)->group(function () {
    Route::get('auth/google', 'redirectToGoogle')->name('auth.google');
    Route::get('auth/google/callback', 'handleGoogleCallback');
});

## Common web routes
Route::name('web.')->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('homepage');
});
