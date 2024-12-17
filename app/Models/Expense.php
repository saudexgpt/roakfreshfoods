<?php

namespace App\Models;

use App\Laravue\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Expense extends Model
{
    use HasFactory;
    use SoftDeletes;
    public function creator()
    {
        return $this->belongsTo(User::class, 'entered_by', 'id');
    }
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }
}
