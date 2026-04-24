const https = require('https');

const data = JSON.stringify({
  model: "google/gemma-2-2b-it",
  messages: [
    { role: "system", content: "You are a test" },
    { role: "user", content: "Hello" }
  ],
  temperature: 0.2,
  top_p: 0.7,
  max_tokens: 1024,
  stream: false
});

const options = {
  hostname: 'integrate.api.nvidia.com',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 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',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', error => console.error(error));

req.write(data);
req.end();
