<?php

namespace App\Http\Resources;

use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
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
            "datetime" => $this->transaction_datetime,
            "user" => new UserResource(User::withTrashed()->find($this->user_id)),
            "game" => new GameResource(Game::find($this->game_id)),
            "type" => $this->type,
            "euros" => $this->euro,
            "coins" => $this->brain_coins,
            "payment" => [
                "type" => $this->payment_type,
                "reference" => $this->payment_reference,
            ]
        ];
    }
}
