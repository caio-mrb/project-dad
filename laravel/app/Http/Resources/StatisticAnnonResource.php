<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatisticAnnonResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "users" => $this["users"],
            "games" => $this["games"],
            "games_last_week" => $this["games_last_week"],
            "games_by_week" => $this["games_by_week"],
        ];
    }
}
