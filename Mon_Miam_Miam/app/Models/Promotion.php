<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model{

    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->where('start_date', '<=', today())
                     ->where('end_date', '>=', today());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', today());
    }

    public function scopeExpired($query)
    {
        return $query->where('end_date', '<', today());
    }

    public function getIsExpiredAttribute()
    {
        return $this->end_date < today();
    }

    public function getIsUpcomingAttribute()
    {
        return $this->start_date > today();
    }
}



    
