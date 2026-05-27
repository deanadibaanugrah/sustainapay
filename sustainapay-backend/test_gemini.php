<?php
$payload = json_encode([
    'contents' => [
        ['parts' => [['text' => 'Halo, jawab singkat dalam 1 kalimat bahasa Indonesia: apa manfaat naik sepeda?']]]
    ]
]);

$ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDC0I6uwTLqfb2B_mLXBcb37TcevGN3ItU');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
if ($error) echo "cURL Error: $error\n";

$data = json_decode($response, true);
if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
    echo "AI Response: " . $data['candidates'][0]['content']['parts'][0]['text'] . "\n";
} else {
    echo "Full Response: $response\n";
}
