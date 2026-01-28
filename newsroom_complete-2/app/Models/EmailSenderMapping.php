<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EmailSenderMapping extends Model
{
    use HasUuids;

    protected $fillable = [
        'source_id', 'collection_method_id', 'sender_email', 'sender_domain',
        'sender_name_pattern', 'priority', 'expected_content_type',
        'is_newsletter', 'is_alert', 'is_active', 'emails_matched',
    ];

    protected $casts = [
        'is_newsletter' => 'boolean', 'is_alert' => 'boolean', 'is_active' => 'boolean',
    ];

    public function source() { return $this->belongsTo(NewsSource::class, 'source_id'); }

    public static function findForEmail(string $email, ?string $name = null): ?self
    {
        if ($m = self::where('sender_email', $email)->where('is_active', true)->first()) return $m;
        $domain = substr($email, strpos($email, '@') + 1);
        if ($m = self::where('sender_domain', $domain)->where('is_active', true)->orderByDesc('priority')->first()) return $m;
        if ($name) {
            foreach (self::whereNotNull('sender_name_pattern')->where('is_active', true)->get() as $m) {
                if (preg_match($m->sender_name_pattern, $name)) return $m;
            }
        }
        return null;
    }
}
