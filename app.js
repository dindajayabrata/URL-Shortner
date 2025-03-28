import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto'
const DATA_file = path.join('data', 'links.json');
const serveFile = async (res, filePath, content) => {
    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': content });
        res.end(data);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': content });
        res.end('404 Page Not Found');
    }
};
const loadLink = async () => {
    try {
        const data = await fs.readFile(DATA_file, 'utf-8');
        if (data.trim() === '') {
            return {};
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(DATA_file, JSON.stringify({}));
            return {};
        }
        throw error;
    }
};
const saveFile = async (links) => {
    await fs.writeFile(DATA_file, JSON.stringify(links))
}
const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            return serveFile(res, path.join("public(HTML)", "index.html"), 'text/html');
        } else if (req.url === '/style.css') {
            return serveFile(res, path.join("public(HTML)", "style.css"), 'text/css');
        } else if (req.url === '/links') {
            const links = await loadLink();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(links));
        }
        else {
            const links = await loadLink();
            const shortCode = req.url.slice(1);
            console.log('link redirect..', req.url);
            if (links[shortCode]) {
                res.writeHead(302, { location: links[shortCode] });
                return res.end();
            }
            else {
                res.writeHead(404, { 'content-type': 'text/plain' });
                return res.end('shortend URL is not found');
            }
        }
    }
    if (req.method === 'POST' && req.url === '/shorten') {
        const links = await loadLink();
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        })
        req.on('end', async () => {
            const { url, shortcode } = JSON.parse(body);
            if (!url) {
                res.writeHead(400, { "content-type": "text/html" });
                return res.end('URL is required');
            }
            const finalshortcode = shortcode || crypto.randomBytes(4).toString('hex');
            if (links[finalshortcode]) {
                res.writeHead(400, { "content-type": "text/plain" });
                return res.end('Shortcode is already used by another. Please use a different shortcode.');
            }
            links[finalshortcode] = url;
            await saveFile(links);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ shortcode: finalshortcode }));
        });
    }
});
server.listen(3001, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3001');
});
