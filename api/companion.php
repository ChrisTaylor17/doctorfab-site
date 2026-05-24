<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

const MAX_BODY_BYTES = 30000;
const MAX_MESSAGES = 8;
const MAX_MESSAGE_CHARS = 900;
const MAX_TOTAL_CHARS = 5000;
const WINDOW_SECONDS = 600;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_REQUESTS_PER_DAY = 40;

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function clean_text(string $value): string
{
    $value = strip_tags($value);
    $value = preg_replace('/[^\P{C}\n\t]/u', '', $value) ?? '';
    return trim($value);
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

function load_config(): array
{
    $paths = [
        dirname(__DIR__, 2) . '/doctorfab-companion-config.php',
        dirname(__DIR__) . '/config.php',
    ];

    foreach ($paths as $path) {
        if (is_readable($path)) {
            $config = require $path;
            return is_array($config) ? $config : [];
        }
    }

    return [];
}

function has_crisis_language(string $text): bool
{
    $patterns = [
        '/\b(suicide|suicidal|kill myself|end my life|take my life|want to die|don.?t want to live)\b/i',
        '/\b(self[-\s]?harm|hurt myself|cut myself|overdose|harm myself)\b/i',
        '/\b(kill someone|hurt someone|harm someone)\b/i',
        '/\b(immediate danger|not safe|unsafe at home|emergency|call 911)\b/i',
        '/\b(abuse|abused|assault|rape|domestic violence|being hurt)\b/i',
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $text) === 1) {
            return true;
        }
    }

    return false;
}

function crisis_reply(): string
{
    return "I am really sorry this is happening. I am going to pause the reflection exercise here because this tool is not for crisis support or immediate danger.\n\nIf you might hurt yourself or someone else, or you are in danger right now, please contact emergency services now. In the United States, you can call or text 988 for the Suicide & Crisis Lifeline.\n\nIf you can, reach out to a trusted person nearby and contact Dr. Fab or another clinician for follow-up support when it is safe to do so.";
}

function normalize_messages_for_anthropic(array $messages): array
{
    $normalized = [];

    foreach ($messages as $message) {
        if ($message['role'] === 'assistant' && $normalized === []) {
            continue;
        }

        $lastIndex = count($normalized) - 1;
        if ($lastIndex >= 0 && $normalized[$lastIndex]['role'] === $message['role']) {
            $normalized[$lastIndex]['content'] .= "\n\n" . $message['content'];
            continue;
        }

        $normalized[] = $message;
    }

    return $normalized;
}

function rate_limit(array $config): void
{
    $storageDir = dirname(__DIR__) . '/storage';
    if (!is_dir($storageDir) && !mkdir($storageDir, 0755, true) && !is_dir($storageDir)) {
        json_response(['error' => 'The companion is resting. Please try again later.'], 503);
    }

    $salt = (string)($config['rate_limit_salt'] ?? 'doctorfab-companion');
    $sessionId = session_id() ?: 'no-session';
    $key = hash_hmac('sha256', client_ip() . '|' . $sessionId, $salt);
    $file = $storageDir . '/companion-rate-limit.json';
    $now = time();
    $dayStart = $now - 86400;
    $windowStart = $now - WINDOW_SECONDS;

    $handle = fopen($file, 'c+');
    if ($handle === false) {
        json_response(['error' => 'The companion is resting. Please try again later.'], 503);
    }

    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        json_response(['error' => 'The companion is resting. Please try again later.'], 503);
    }
    $raw = stream_get_contents($handle);
    $data = $raw ? json_decode($raw, true) : [];
    if (!is_array($data)) {
        $data = [];
    }

    foreach ($data as $storedKey => $timestamps) {
        $timestamps = is_array($timestamps) ? array_filter($timestamps, fn($ts) => is_int($ts) && $ts >= $dayStart) : [];
        if ($timestamps === []) {
            unset($data[$storedKey]);
        } else {
            $data[$storedKey] = array_values($timestamps);
        }
    }

    $timestamps = $data[$key] ?? [];
    $recent = array_values(array_filter($timestamps, fn($ts) => is_int($ts) && $ts >= $windowStart));
    $daily = array_values(array_filter($timestamps, fn($ts) => is_int($ts) && $ts >= $dayStart));

    if (count($recent) >= MAX_REQUESTS_PER_WINDOW || count($daily) >= MAX_REQUESTS_PER_DAY) {
        header('Retry-After: 600');
        flock($handle, LOCK_UN);
        fclose($handle);
        json_response(['error' => 'The companion is taking a short pause. Please try again later.'], 429);
    }

    $daily[] = $now;
    $data[$key] = $daily;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($data));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed.'], 405);
}

$secureCookie = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $secureCookie,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength <= 0 || $contentLength > MAX_BODY_BYTES) {
    json_response(['error' => 'Please send a shorter reflection.'], 413);
}

$rawBody = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($rawBody === false || strlen($rawBody) > MAX_BODY_BYTES) {
    json_response(['error' => 'Please send a shorter reflection.'], 413);
}

$input = json_decode($rawBody, true);
if (!is_array($input) || !isset($input['messages']) || !is_array($input['messages'])) {
    json_response(['error' => 'Malformed request.'], 400);
}

$messages = [];
$totalChars = 0;
foreach (array_slice($input['messages'], -MAX_MESSAGES) as $message) {
    if (!is_array($message)) {
        json_response(['error' => 'Malformed request.'], 400);
    }

    $role = $message['role'] ?? '';
    $content = clean_text((string)($message['content'] ?? ''));
    if (!in_array($role, ['user', 'assistant'], true) || $content === '') {
        json_response(['error' => 'Malformed request.'], 400);
    }

    if (text_length($content) > MAX_MESSAGE_CHARS) {
        json_response(['error' => 'Please keep each message under ' . MAX_MESSAGE_CHARS . ' characters.'], 413);
    }

    $totalChars += text_length($content);
    $messages[] = ['role' => $role, 'content' => $content];
}

if ($messages === [] || $totalChars > MAX_TOTAL_CHARS) {
    json_response(['error' => 'Please shorten the conversation and try again.'], 413);
}

$lastUserMessage = '';
for ($i = count($messages) - 1; $i >= 0; $i--) {
    if ($messages[$i]['role'] === 'user') {
        $lastUserMessage = $messages[$i]['content'];
        break;
    }
}

if ($lastUserMessage === '') {
    json_response(['error' => 'Please share a reflection first.'], 400);
}

if (has_crisis_language($lastUserMessage)) {
    json_response(['reply' => crisis_reply(), 'crisis' => true]);
}

$messages = normalize_messages_for_anthropic($messages);
if ($messages === [] || $messages[0]['role'] !== 'user') {
    json_response(['error' => 'Please share a reflection first.'], 400);
}

$config = load_config();
$apiKey = trim((string)($config['anthropic_api_key'] ?? ''));
if ($apiKey === '' || $apiKey === 'PASTE_YOUR_ANTHROPIC_API_KEY_HERE') {
    json_response(['error' => 'The companion is not configured yet.'], 503);
}

rate_limit($config);

$systemPromptPath = __DIR__ . '/companion-system-prompt.md';
$systemPrompt = is_readable($systemPromptPath) ? file_get_contents($systemPromptPath) : '';
if (!$systemPrompt) {
    json_response(['error' => 'The companion is not ready yet.'], 503);
}

$payload = [
    'model' => (string)($config['anthropic_model'] ?? 'claude-haiku-4-5-20251001'),
    'max_tokens' => (int)($config['max_tokens'] ?? 420),
    'temperature' => (float)($config['temperature'] ?? 0.6),
    'system' => $systemPrompt,
    'messages' => $messages,
];

$encodedPayload = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($encodedPayload === false) {
    json_response(['error' => 'The companion could not prepare a response.'], 500);
}

$anthropicVersion = (string)($config['anthropic_version'] ?? '2023-06-01');
$timeoutSeconds = max(10, min(60, (int)($config['request_timeout_seconds'] ?? 25)));

$ch = curl_init('https://api.anthropic.com/v1/messages');
if ($ch === false) {
    json_response(['error' => 'The companion is resting. Please try again later.'], 503);
}

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: ' . $anthropicVersion,
    ],
    CURLOPT_POSTFIELDS => $encodedPayload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => $timeoutSeconds,
]);

$response = curl_exec($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $status < 200 || $status >= 300) {
    error_log('Doctor Fab companion API error: status=' . $status . ' curl=' . $curlError);
    json_response(['error' => 'The companion could not respond right now. Please try again later.'], 502);
}

$decoded = json_decode($response, true);
$reply = '';
if (is_array($decoded['content'] ?? null)) {
    foreach ($decoded['content'] as $block) {
        if (($block['type'] ?? '') === 'text' && isset($block['text'])) {
            $reply .= (string)$block['text'];
        }
    }
}

$reply = trim($reply);
if ($reply === '') {
    json_response(['error' => 'The companion could not respond right now. Please try again later.'], 502);
}

json_response(['reply' => $reply, 'crisis' => false]);
