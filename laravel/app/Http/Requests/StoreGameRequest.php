<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
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
            "type" => "required|in:S,M",
            "status" => "required|in:PE,PL,E,I",
            "began_at" => "nullable|date_format:Y-m-d H:i:s",
            "board_id" => "required|exists:boards,id",
        ];
    }
}
