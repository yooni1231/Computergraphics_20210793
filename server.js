//server.js
const http = require('http');
const fs = require('fs');
const path = require('path'); 
const port = 3000;

const server = http.createServer((req, res) => {
    
    let filePath = req.url === '/' ? '/index.html' : req.url;

    let fullPath = path.join(__dirname, 'public', filePath);

    let ext = path.extname(fullPath);
    let contentType = 'text/html';

    switch (ext) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.stl': contentType = 'model/stl'; break;
        case '.json': contentType = 'text/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;  
    }

    fs.readFile(fullPath, (err, data) => { // 이 fullPath가 올바르게 만들어져야 합니다.
        if (err) {
            console.error(`파일을 찾을 수 없음: ${fullPath}`); 
            res.writeHead(404);
            res.end('Error: 404 - File Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(port, () => {
    console.log(`Node.js 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});