<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGameFinished extends FormRequest
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
            "status" => "required|in:E",
            "ended_at" => "required|date_format:Y-m-d H:i:s",
            "total_time" => "required|numeric|between:0,99999999.99",
            "total_turns_winner" => "required|integer|gt:0"
        ];
    }
}
