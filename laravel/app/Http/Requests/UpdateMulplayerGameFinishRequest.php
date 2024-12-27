<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMulplayerGameFinishRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "won" => "required|boolean",
            "pairs" => "required|integer",

            "winner_user_id" => "sometimes|integer|exists:users,id",
            "winner_pairs" => "required_with:winner_user_id|integer",
        ];
    }
}
