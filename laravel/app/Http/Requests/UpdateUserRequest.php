<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
            "email" => "nullable|email|unique:users,email",
            "name" => "nullable|string",
            "nickname" => "nullable|string|unique:users,nickname|max:15",
            "photo" => "nullable|file|mimes:jpeg,png,jpg|max:16384",
        ];
    }
}
