<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransitionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $trans = Transaction::where("user_id", "=", $request->user()->id)
            ->orderBy('transaction_datetime', "desc")
            ->get();
        return TransactionResource::collection($trans);
    }

    /**
     * Display a listing of the resource.
     */
    public function all(Request $request)
    {
        $data = Transaction::orderBy('transaction_datetime', "desc")
            ->paginate(20);

        return TransactionResource::collection($data);
    }

    /**
     * Display a listing of the resource.
     */
    public function allP(Request $request)
    {
        $data = Transaction::where('type', '=', "P")
            ->orderBy('transaction_datetime', "desc")
            ->paginate(20);

        return TransactionResource::collection($data);
    }

    /**
     * Display a listing of the resource.
     */
    public function allPU(Request $request, $nickname)
    {
        $id = User::where("nickname", "=", $nickname)->first()->id;
        $data = Transaction::where('type', '=', "P")
            ->where("user_id", "=", $id)
            ->orderBy('transaction_datetime', "desc")
            ->paginate(20);

        return TransactionResource::collection($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransitionRequest $request)
    {
        $fields = $request->validated();
        $user = $request->user();

        if($fields["user_id"] != $user->id){
            return response(["data" => ["message" => "You're trying to add a transaction to another user!"]], 400);
        }

        $trans = Transaction::create($fields);

        if (in_array($fields["type"], ["I", "P"])) {
            $user->brain_coins_balance += $fields["brain_coins"];
            $user->save();
        }

        return new TransactionResource($trans);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        return new TransactionResource($transaction);
    }
}
