<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        "created_user_id",
        "winner_user_id",
        "type",
        "status",
        "began_at",
        "ended_at",
        "total_time",
        "board_id"
    ];
    
    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function winner_user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function created_user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }
    
    public function multiplayer_games(): HasMany
    {
        return $this->hasMany(MultiplayerGame::class);
    }
}
