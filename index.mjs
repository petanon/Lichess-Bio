import express from 'express';
import fetch from 'node-fetch';
import { create } from 'xmlbuilder2';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/lichess-stats/:username', async (req, res) => {
    const { username } = req.params;
    console.log(`Fetching data for user: ${username}`);

    try {
        const response = await fetch(`https://lichess.org/api/user/${username}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data for user: ${username}`);
        }
        const data = await response.json();
        console.log('Data fetched successfully:', data);

        const seenAt = new Date(data.seenAt);
        const now = new Date();
        const timeDiff = now - seenAt;

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60)) / 1000 / 60);

        const svg = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 600, height: 300, style: 'border-radius: 9px; background-color: #1e1e1e; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);' })
                .ele('style')
                    .txt(`
                        text {
                            font-family: 'Roboto Condensed', sans-serif;
                            fill: #f5f5f5;
                        }
                        .header {
                            font-size: 26px;
                            text-anchor: middle;
                        }
                        .subheader {
                            font-size: 18px;
                            text-anchor: middle;
                        }
                        .content {
                            font-size: 16px;
                        }
                        .rating-bar {
                            fill: #4caf50;
                        }
                        .border-box {
                            stroke: #4a4a4a;
                            stroke-width: 2;
                            fill: none;
                            rx: 9;
                            ry: 9;
                        }
                        .icon {
                            width: 20px;
                            height: 20px;
                            fill: #f5f5f5;
                            margin-right: 5px;
                        }
                        .graph {
                            fill: #4caf50;
                        }
                    `).up()
                .ele('rect', { width: '100%', height: '100%', fill: '#1e1e1e', rx: 9, ry: 9 }).up()
                .ele('rect', { x: 10, y: 10, width: 580, height: 280, class: 'border-box' }).up()
                .ele('text', { x: 300, y: 50, class: 'header' })
                    .txt(`⚜️${data.username}⚜️`).up()
                .ele('text', { x: 300, y: 80, class: 'subheader' })
                    .txt(`Online: ${days} days, ${hours} h, and ${minutes} min ago`).up()
                .ele('text', { x: 50, y: 150, class: 'content' })
                    .ele('svg', { x: 0, y: -12, class: 'icon', viewBox: '0 0 16 16' })
                        .ele('path', { d: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM5 12l4-8v8H5z' }).up().up()
                    .txt(`🧠Rapid: ${data.perfs.rapid.rating}`).up()
                .ele('rect', { x: 150, y: 140, width: `${data.perfs.rapid.rating / 3000 * 400}`, height: 20, class: 'graph' }).up()
                .ele('text', { x: 50, y: 200, class: 'content' })
                    .ele('svg', { x: 0, y: -12, class: 'icon', viewBox: '0 0 16 16' })
                        .ele('path', { d: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM5 12l4-8v8H5z' }).up().up()
                    .txt(`🔥Blitz: ${data.perfs.blitz.rating}`).up()
                .ele('rect', { x: 150, y: 190, width: `${data.perfs.blitz.rating / 3000 * 400}`, height: 20, class: 'graph' }).up()
                .ele('text', { x: 50, y: 250, class: 'content' })
                    .ele('svg', { x: 0, y: -12, class: 'icon', viewBox: '0 0 16 16' })
                        .ele('path', { d: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM5 12l4-8v8H5z' }).up().up()
                    .txt(`⚡Bullet: ${data.perfs.bullet.rating}`).up()
                .ele('rect', { x: 150, y: 240, width: `${data.perfs.bullet.rating / 3000 * 400}`, height: 20, class: 'graph' }).up()
                .ele('text', { x: 50, y: 300, class: 'content' })
                    .ele('svg', { x: 0, y: -12, class: 'icon', viewBox: '0 0 16 16' })
                        .ele('path', { d: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM5 12l4-8v8H5z' }).up().up()
            .end({ prettyPrint: true });

        console.log('SVG generated successfully:', svg);

        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
