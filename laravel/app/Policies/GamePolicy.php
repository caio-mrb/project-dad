<?php

namespace App\Policies;

use App\Models\Game;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GamePolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): bool|null
    {
        if ($user->type == "A") {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function view(User $user, Game $game): bool
    {
        return $user->id == $game->created_user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Game $game): bool
    {
        return $user->id == $game->created_user_id;
    }
}
