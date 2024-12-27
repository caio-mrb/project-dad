<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordUserRequest;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserAdminResource;
use App\Http\Resources\UserMeResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use GuzzleHttp\Psr7\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function showMe(Request $request)
    {
        return new UserMeResource($request->user());
    }

    public function show(Request $request, string $nickname)
    {
        $user = User::where("nickname", "=", $nickname)->get()->first();

        if(!$user)
            return response()->json(["data" => ["message" => "User not found"]], 404);

        return new UserResource($user);
    }

    public function showAdmin(Request $request, string $nickname)
    {
        $user = User::where("nickname", "=", $nickname)->get()->first();

        if(!$user)
            return response()->json(["data" => ["message" => "User not found"]], 404);
        
        return new UserAdminResource($user);
    }

    public function create(CreateUserRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {

            $file = $request->file('photo');

            $id = (User::max('id') ?? 0) + 1;

            $filename = explode("/", $file->storeAs('photos', $id . "_" . substr($file->hashName(), - (13 + strlen($file->extension()))), 'public'))[1];

            unset($data["photo"]);
            $data["photo_filename"] = $filename;
        }

        $user = User::create($data);

        return new UserResource($user);
    }

    public function createAdmin(CreateUserRequest $request)
    {
        $data = $request->validated();
        $data["type"] = "A";

        if ($request->hasFile('photo')) {

            $file = $request->file('photo');

            $id = (User::max('id') ?? 0) + 1;

            $filename = explode("/", $file->storeAs('photos', $id . "_" . substr($file->hashName(), - (13 + strlen($file->extension()))), 'public'))[1];

            unset($data["photo"]);
            $data["photo_filename"] = $filename;
        }

        $user = User::create($data);

        return new UserResource($user);
    }

    public function deleteSelf(Request $request)
    {
        $request->user()->delete();

        return response()->json(["data" => ["message" => "User deleted successfully!"]]);
    }

    public function delete(Request $request, User $user)
    {
        $user->delete();

        return response()->json(["data" => ["message" => "User deleted successfully!"]]);
    }

    public function block(Request $request, User $user)
    {
        $user->blocked = !$user->blocked;
        $user->save();

        return response()->json(["data" => ["message" => "User " . ($user->blocked ? "" : "un") . "blocked successfully!"]]);
    }

    public function update(UpdateUserRequest $request)
    {

        $user = $request->user();

        $user->update($request->validated());

        $user->save();

        if ($request->hasFile('photo')) {

            $file = $request->file('photo');

            $file->storeAs('photos', $user->photo_filename, 'public');
        }

        return response()->json(["data" => ["message" => "User updated successfully!"]]);
    }

    public function changePassword(ChangePasswordUserRequest $request)
    {
        $fields = $request->validated();

        $user = $request->user();

        if (Hash::check($fields["password_old"], $user->password) && $fields["password"] == $fields["password_confirm"]) {

            $user->update(["password" => $fields["password"]]);
            $user->save();

            return response()->json(["data" => ["message" => "Password updated successfully!"]]);
        } else {

            if ($fields["password"] != $fields["password_confirm"])
                return response()->json(["data" => ["message" => "Your password confirmation is wrong!"]]);
            else
                return response()->json(["data" => ["message" => "Your old password is wrong!"]]);
        }
    }

    public function index(Request $request)
    {
        return UserAdminResource::collection(User::where("type", "=", "P")->orderBy("nickname", "asc")->paginate(20));
    }
    public function indexAdmin(Request $request)
    {
        return UserAdminResource::collection(User::where("type", "=", "A")->orderBy("nickname", "asc")->paginate(20));
    }
}
