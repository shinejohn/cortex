<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class PressRelease extends Model
{
    use HasUuids;

    protected $fillable = [
        'raw_content_id', 'community_id', 'region_id',
        'company_name', 'contact_name', 'contact_email', 'contact_phone',
        'source_wire_service', 'headline', 'subheadline', 'body',
        'dateline_city', 'dateline_state', 'release_date', 'embargo_until',
        'press_release_type', 'geographic_scope', 'output_types_determined',
        'status', 'routed_outputs', 'attachments',
    ];

    protected $casts = [
        'output_types_determined' => 'array',
        'routed_outputs' => 'array',
        'attachments' => 'array',
        'release_date' => 'datetime',
        'embargo_until' => 'datetime',
    ];

    public function rawContent()
    {
        return $this->belongsTo(RawContent::class);
    }

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}
