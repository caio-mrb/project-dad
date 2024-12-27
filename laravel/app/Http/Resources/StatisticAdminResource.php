<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatisticAdminResource extends JsonResource
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
            "name" => $this->name,
            "balance" => $this->brain_coins_balance,
            "email" => $this->email,
            "nickname" => $this->nickname,
            "type" => $this->type,
            "blocked" => $this->blocked,
            "photo" => $this->photo_filename,
            "transactions" => TransactionResource::collection($this->transaction),
        ];
    }
}
