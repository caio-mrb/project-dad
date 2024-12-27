<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\MultiplayerGameController;
use App\Http\Controllers\StatisticController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Models\Game;
use App\Models\MultiplayerGame;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/games/global', [GameController::class, "global"]);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/auth/refreshtoken', [AuthController::class, 'refreshToken']);

    Route::get('/users/me', [UserController::class, 'showMe']);

    Route::delete('/users/', [UserController::class, 'deleteSelf'])
        ->can("deleteSelf", User::class);

    Route::delete('/users/{user}', [UserController::class, 'delete'])
        ->can("delete", "user");

    Route::post('/users/admin', [UserController::class, 'createAdmin'])
        ->can("create", User::class);

    Route::patch('/users/{user}', [UserController::class, 'block'])
        ->can("block", User::class);

    Route::get('/users/', [UserController::class, 'index'])
        ->can("viewAny", User::class);


    Route::get('/users/admins', [UserController::class, 'indexAdmin'])
        ->can("viewAny", User::class);

    Route::get('/users/{nickname}', [UserController::class, 'show']);

    Route::get('/users/admin/{nickname}', [UserController::class, 'showAdmin'])
        ->can("viewAny", User::class);

    Route::put('/users/', [UserController::class, 'update']);
    Route::patch('/users/', [UserController::class, 'changePassword']);

    // GAMES SINGLE

    Route::get('/games/personal', [GameController::class, "personal"]);
    Route::get('/games/', [GameController::class, "index"]);
    Route::get('/games/{game}', [GameController::class, "show"])
        ->can("view", "game");

    Route::post('/games/', [GameController::class, "store"]);

    Route::put('/games/{game}', [GameController::class, "update"])
        ->can("update", "game");
        
    Route::patch('/games/{game}', [GameController::class, "patch"])
        ->can("update", "game");



    Route::get('/games/admin/{user}', [GameController::class, 'indexAdmin'])
        ->can("viewAny", User::class);


    //MULTIPLAYER GAMES

    Route::get('/multiplayergames/', [MultiplayerGameController::class, "index"]);

    Route::get('/multiplayergames/{multiplayerGame}', [MultiplayerGameController::class, "show"])
        ->can("view", MultiplayerGame::class);

    Route::post('/multiplayergames/', [MultiplayerGameController::class, "store"]);

    Route::put('/multiplayergames/{multiplayerGame}', [MultiplayerGameController::class, "update"])
        ->can("update", MultiplayerGame::class);

    Route::get('/multiplayergames/admin/{user}', [MultiplayerGameController::class, 'indexAdmin'])
        ->can("viewAny", User::class);

    //TRANSACTIONS

    Route::get('/transactions/', [TransactionController::class, "index"]);

    Route::get('/transactions/all', [TransactionController::class, "all"])
        ->can("all", Transaction::class);

    Route::get('/transactions/all/purchases', [TransactionController::class, "allP"])
        ->can("all", Transaction::class);

    Route::get('/transactions/all/purchases/{nickname}', [TransactionController::class, "allPU"])
        ->can("all", Transaction::class);

    Route::get('/transactions/{transaction}', [TransactionController::class, "show"])
        ->can("view", "transaction");

    Route::post('/transactions/', [TransactionController::class, "store"]);

    //statistics
    Route::get('/statistics/', [StatisticController::class, "admin"])
        ->can("all", Transaction::class);
});

Route::post('/auth/login', [AuthController::class, "login"]);

Route::post('/users/', [UserController::class, 'create']);

Route::get('/boards/', [BoardController::class, "index"]);
Route::get('/boards/{board}', [BoardController::class, "show"]);

Route::get('/statistics/', [StatisticController::class, "annon"]);
