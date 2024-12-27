<?php

namespace App\Http\Resources;

use App\Models\Board;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "board" => new BoardResource(Board::find($this->board_id)),
            "created_user" => new UserResource(User::withTrashed()->find($this->created_user_id)),
            "winner_user" => new UserResource(User::withTrashed()->find($this->winner_user_id)),
            "type" => $this->type,
            "status" => $this->status,
            "began_at" => $this->began_at,
            "ended_at" => $this->ended_at,
            "total_time" => $this->total_time,
            "total_turns_winner" => $this->total_turns_winner
        ];
    }
}
