<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransitionRequest extends FormRequest
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
            "transaction_datetime" => "required|date_format:Y-m-d H:i:s",
            "user_id" => "required|exists:users,id",
            "type" => "required|in:B,P,I",
            "brain_coins" => "required|integer",

            "game_id" => "required_if:type,I|prohibited_if:type,B,P|exists:games,id",

            "euros" => "required_if:type,P|prohibited_if:type,B,I|numeric|between:0,9999999.99",
            "payment_type" => "required_if:type,P|prohibited_if:type,B,I|in:MBWAY,PAYPAL,IBAN,MB,Visa",
            "payment_reference" => "prohibited_if:type,B,I|nullable|string"
        ];
    }
}
