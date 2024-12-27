<?php

namespace App\Policies;

use App\Models\MultiplayerGame;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class MultiplayerGamePolicy
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
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MultiplayerGame $multiplayerGame): bool
    {
        return $user->id == $multiplayerGame->user_id || true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MultiplayerGame $multiplayerGame): bool
    {
        return $user->id == $multiplayerGame->user_id;
    }
}
