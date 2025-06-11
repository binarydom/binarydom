"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryDOMComponent_1 = require("../BinaryDOMComponent");
const BinaryDOMRenderer_1 = require("../BinaryDOMRenderer");
class Counter extends BinaryDOMComponent_1.BinaryDOMComponent {
    render() {
        const [count, setCount] = (0, BinaryDOMComponent_1.useState)(0);
        return {
            type: "div",
            props: {
                className: "counter",
                children: [
                    {
                        type: "h1",
                        props: {
                            children: `Count: ${count}`,
                        },
                    },
                    {
                        type: "button",
                        props: {
                            onClick: () => setCount(count + 1),
                            children: "Increment",
                        },
                    },
                ],
            },
        };
    }
}
// Usage
const container = document.getElementById("root");
if (container) {
    const renderer = new BinaryDOMRenderer_1.BinaryDOMRenderer(container);
    const counter = new Counter({});
    renderer.render(counter.render());
}
