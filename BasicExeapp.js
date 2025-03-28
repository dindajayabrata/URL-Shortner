import http from 'http';
import fs from 'fs/promises';
import path from 'path';
const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            try {
                const data = await fs.readFile(path.join("public(HTML)", "index.html"));
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('404 Page Not Found');
            }
        } else if (req.url === '/style.css') {
            try {
                const data = await fs.readFile(path.join("public(HTML)", "style.css"));
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'text/css' });
                res.end('/* 404 CSS File Not Found */');
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('404 Page Not Found');
        }
    }
});

server.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
