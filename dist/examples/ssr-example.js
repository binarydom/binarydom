"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryDOMServer_1 = require("../ssr/BinaryDOMServer");
const BinaryDOMRenderer_1 = require("../BinaryDOMRenderer");
const BinaryDOMHydration_1 = require("../ssr/BinaryDOMHydration");
// Example component
const Counter = {
    id: "counter",
    type: "element",
    tagName: "div",
    props: {
        className: "counter",
        children: [
            {
                id: "counter-title",
                type: "element",
                tagName: "h1",
                props: {
                    children: [
                        {
                            id: "counter-text",
                            type: "text",
                            props: { text: "Counter: 0" },
                            attributes: new Map(),
                            children: [],
                            left: null,
                            right: null,
                            parent: null,
                            checksum: 0,
                            isDirty: false,
                            eventHandlers: new Map(),
                            state: null,
                            hooks: [],
                        },
                    ],
                },
                attributes: new Map(),
                children: [],
                left: null,
                right: null,
                parent: null,
                checksum: 0,
                isDirty: false,
                eventHandlers: new Map(),
                state: null,
                hooks: [],
            },
        ],
    },
    attributes: new Map(),
    children: [],
    left: null,
    right: null,
    parent: null,
    checksum: 0,
    isDirty: false,
    eventHandlers: new Map(),
    state: null,
    hooks: [],
};
// Server-side rendering
const server = BinaryDOMServer_1.BinaryDOMServer.getInstance();
const html = server.renderToString(Counter);
// Client-side hydration
const container = document.getElementById("root");
if (container) {
    const renderer = new BinaryDOMRenderer_1.BinaryDOMRenderer(container);
    const hydration = BinaryDOMHydration_1.BinaryDOMHydration.getInstance(renderer);
    hydration.hydrate(Counter, container);
}
// Example usage in a Node.js server (Express)
/*
import express from 'express';
const app = express();

app.get('/', (req, res) => {
  const html = server.renderToString(Counter);
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Binary DOM SSR Example</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
});

app.listen(3000);
*/
