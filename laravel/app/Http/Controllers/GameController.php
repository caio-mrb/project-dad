<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatchGameStatusRequest;
use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameFinished;
use App\Http\Resources\GameResource;
use App\Http\Resources\UserResource;
use App\Models\Board;
use App\Models\Game;
use App\Models\MultiplayerGame;
use App\Models\User;
use Illuminate\Http\Request;

class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $games = Game::where("type", "=", "S")->where("created_user_id", "=", $request->user()->id)->orderBy("began_at", "desc")->get();

        return GameResource::collection($games);
    }
    
    /**
     * Display a listing of the resource.
     */
    public function indexAdmin(Request $request, User $user)
    {
        $games = Game::where("type", "=", "S")->where("created_user_id", "=", $user->id)->orderBy("began_at", "desc")->get();

        return GameResource::collection($games);
    }
    /**
     * Display a listing of the resource.
     */
    public function global(Request $request)
    {
        $boards = Board::all();

        $games = [];

        foreach ($boards as $board) {
            $games["time"][$board->id] = GameResource::collection(Game::where("board_id", "=", $board->id)
                ->whereNotIn("id", MultiplayerGame::all("game_id"))
                ->whereNotNull("total_time")
                ->orderBy("total_time", "asc")
                ->take(5)
                ->get());
        }

        foreach ($boards as $board) {
            $games["turns"][$board->id] = GameResource::collection(Game::where("board_id", "=", $board->id)
                ->whereNotIn("id", MultiplayerGame::all("game_id"))
                ->whereNotNull("total_turns_winner")
                ->orderBy("total_turns_winner", "asc")
                ->take(5)
                ->get());
        }



        $mult = MultiplayerGame::where("player_won", "=", true)
            ->groupBy("user_id")
            ->selectRaw("user_id, count(*) as wins, avg(pairs_discovered) as discovered_avg")
            ->orderBy("wins", "desc")
            ->take(5)
            ->get();

        foreach ($mult as $k => $v) {
            $user = User::withTrashed()->find($v["user_id"]);
            unset($mult[$k]["user_id"]);
            $mult[$k]["user"] = new UserResource($user);
        }

        $games["multiplayer"] = $mult;

        return ["data" => $games];
    }
    public function personal(Request $request)
    {
        $games = Game::where("created_user_id", "=", $request->user()->id)
            ->orderBy("total_time", "desc")
            ->take(5)
            ->get();

        return GameResource::collection($games);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        $fields = $request->validated();

        $fields["created_user_id"] = $request->user()->id;

        $game = Game::create($fields);

        return new GameResource($game);
    }

    /**
     * Display the specified resource.
     */
    public function show(Game $game)
    {
        return new GameResource($game);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGameFinished $request, Game $game)
    {
        $fields = $request->validated();

        $game->status = $fields["status"];
        $game->total_time = $fields["total_time"];
        $game->ended_at = $fields["ended_at"];
        $game->total_turns_winner = $fields["total_turns_winner"];
        $game->winner_user_id = $request->user()->id;

        $game->save();

        return new GameResource($game);
    }

    /**
     * Patch the specified resource in storage.
     */
    public function patch(PatchGameStatusRequest $request, Game $game)
    {
        $game->update($request->validated());
        $game->save();

        return new GameResource($game);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Game $game)
    {
        //
    }
}
