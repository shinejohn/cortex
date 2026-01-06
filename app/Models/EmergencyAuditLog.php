<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class EmergencyAuditLog extends Model
{
    use HasFactory;
    
    protected $table = 'emergency_audit_log';

    protected $fillable = [
        'alert_id',
        'user_id',
        'municipal_partner_id',
        'action',
        'changes',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function alert(): BelongsTo
    {
        return $this->belongsTo(EmergencyAlert::class, 'alert_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function municipalPartner(): BelongsTo
    {
        return $this->belongsTo(MunicipalPartner::class, 'municipal_partner_id');
    }
}
