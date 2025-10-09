import express from "express"
import { createServer } from "vite"
import Parser from 'rss-parser';

(async () => {
    const port = 3000

    const app = express()

    app.use("/api/feed", async (req, res) => {
        const parser = new Parser();
        const feed = await parser.parseURL(req.query.url as string);
        feed.items = feed.items.map((item) => {
            // extract image url from content using any image url regex
            const imageUrl = item.content?.match(/<img[^>]+src="([^"]+)"/) || item['content:encoded']?.match(/<img[^>]+src="([^"]+)"/);

            return {
                ...item,
                imageUrl: imageUrl ? imageUrl[1] : null
            }
        })
        res.send({
            items: feed.items,
            title: feed.title
        });
    })

    const viteDevServer = await createServer({
        server: {
            middlewareMode: true
        },
        root: "src",
        base: "/",
    });
    app.use(viteDevServer.middlewares)

    app.listen(port)
    console.log("Server started: http://localhost:" + port)

})()