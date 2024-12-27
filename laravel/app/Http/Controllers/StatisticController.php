<?php

namespace App\Http\Controllers;

use App\Http\Resources\StatisticAdminResource;
use App\Http\Resources\StatisticAnnonResource;
use App\Models\Game;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class StatisticController extends Controller
{
    /**
     * Display basic statistics.
     */
    public function annon()
    {
        $statistics = [];

        $statistics["users"] = User::count();
        $statistics["games"] = Game::count();


        $statistics["games_by_week"] = Game::selectRaw('
                                        WEEK(began_at, 1) as week_year, 
                                        DATE_SUB(date(began_at), INTERVAL WEEKDAY(began_at) DAY)as start_day, 
                                        COUNT(*) as count')
            ->groupBy('week_year', 'start_day')
            ->orderBy('start_day', "asc")
            ->get();

        $statistics["games_last_week"] = $statistics["games_by_week"]->last();


        return new StatisticAnnonResource($statistics);
    }
    
    public function admin()
    {
        $data = User::with("transaction")->paginate(20);

        return StatisticAdminResource::collection($data);
    }
}
