const http = require('http');

const data = JSON.stringify({
  text: 'Hello world',
  language: 'en'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/qa/speak',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let chunks = [];
  res.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log(`Received ${buffer.length} bytes`);
    console.log(`First 5 bytes hex: ${buffer.slice(0, 5).toString('hex')}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
