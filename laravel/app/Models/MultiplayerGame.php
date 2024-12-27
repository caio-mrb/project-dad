<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MultiplayerGame extends Model
{
    use HasFactory;

    protected $table = 'multiplayer_games_played';
    public $timestamps = false;

    protected $fillable = [
        "user_id",
        "game_id",
        "player_won",
        "pairs_discovered"
    ];

    protected function casts(): array
    {
        return [
            "player_won" => "boolean",
            "pairs_discovered" => "integer"
        ];
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
