const http = require('http');

const data = JSON.stringify({
    productName: "",
    brandId: null,
    categoryId: null,
    isActive: null,
    page: 0,
    size: 100
});

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/product/search',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
