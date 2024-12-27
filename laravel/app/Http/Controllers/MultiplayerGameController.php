<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMultiplayerGameRequest;
use App\Http\Requests\UpdateMulplayerGameFinishRequest;
use App\Http\Resources\GameResource;
use App\Http\Resources\MultiplayerGameResource;
use App\Http\Resources\UserResource;
use App\Models\Game;
use App\Models\MultiplayerGame;
use App\Models\User;
use Illuminate\Http\Request;

class MultiplayerGameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user_games = MultiplayerGame::where("user_id", "=", $request->user()->id)->pluck('game_id');

        $games = MultiplayerGame::whereIn("game_id", $user_games)->get();

        $data = $games->groupBy("game_id")->map(function ($group) {

            return [
                "game" => new GameResource(Game::find($group->first()->game_id)),
                "players" => $group->map(function ($user) {
                    return [
                        "user" => new UserResource(User::withTrashed()->find($user->user_id)),
                        "won" => $user->player_won,
                        "pairs_discovered" => $user->pairs_discovered
                    ];
                })
            ];
        });

        return MultiplayerGameResource::collection($data);
    }

    /**
     * Display a listing of the resource.
     */
    public function indexAdmin(Request $request, User $user)
    {
        $user_games = MultiplayerGame::where("user_id", "=", $user->id)->pluck('game_id');

        $games = MultiplayerGame::whereIn("game_id", $user_games)->get();

        $data = $games->groupBy("game_id")->map(function ($group) {

            return [
                "game" => new GameResource(Game::find($group->first()->game_id)),
                "players" => $group->map(function ($user) {
                    return [
                        "user" => new UserResource(User::withTrashed()->find($user->user_id)),
                        "won" => $user->player_won,
                        "pairs_discovered" => $user->pairs_discovered
                    ];
                })
            ];
        });

        return MultiplayerGameResource::collection($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMultiplayerGameRequest $request)
    {
        $fields = $request->validated();
        $fields["user_id"] = $request->user()->id;

        $game = MultiplayerGame::create($fields);

        return new MultiplayerGameResource($game);
    }

    /**
     * Display the specified resource.
     */
    public function show(MultiplayerGame $multiplayerGame)
    {
        $games = MultiplayerGame::where("game_id", "=", $multiplayerGame->game_id)->get();

        $data = $games->groupBy("game_id")->map(function ($group) {

            return [
                "game" => new GameResource(Game::find($group->first()->game_id)),
                "players" => $group->map(function ($user) {
                    return [
                        "user" => new UserResource(User::withTrashed()->find($user->user_id)),
                        "won" => $user->player_won,
                        "pairs_discovered" => $user->pairs_discovered
                    ];
                })
            ];
        });

        return MultiplayerGameResource::collection($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMulplayerGameFinishRequest $request, MultiplayerGame $multiplayerGame)
    {
        $fields = $request->validated();

        $multiplayerGame->player_won = $fields["won"];
        $multiplayerGame->pairs_discovered = $fields["pairs"];

        $game = $multiplayerGame->game;
        if (isset($fields["winner_user_id"]) && $game->created_user_id == $request->user()->id) {
            $game->winner_user_id = $fields["winner_user_id"];
            $game->total_turns_winner = $fields["winner_pairs"];
            $game->status = "E";
            $game->save();
        }

        $multiplayerGame->save();

        return new MultiplayerGameResource($multiplayerGame);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MultiplayerGame $multiplayerGame)
    {
        //
    }
}
