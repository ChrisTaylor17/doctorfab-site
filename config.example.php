<?php
/**
 * Doctor Fab Reflection & Grounding Companion configuration.
 *
 * Preferred Hostinger setup:
 * 1. Copy this file to ../doctorfab-companion-config.php, one folder above
 *    public_html, and paste the real Anthropic API key there.
 * 2. If that is not possible, copy it to config.php in the web root.
 *
 * Never commit a real API key.
 */
return [
    'anthropic_api_key' => 'PASTE_YOUR_ANTHROPIC_API_KEY_HERE',
    'anthropic_model' => 'claude-3-5-haiku-20241022',
    'anthropic_version' => '2023-06-01',
    'rate_limit_salt' => 'CHANGE_THIS_TO_A_LONG_RANDOM_STRING',
    'request_timeout_seconds' => 25,
    'max_tokens' => 420,
    'temperature' => 0.6,
];
