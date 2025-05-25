import { BinaryDOMComponent, useState } from "../BinaryDOMComponent";
import { BinaryDOMRenderer } from "../BinaryDOMRenderer";

class Counter extends BinaryDOMComponent {
  render() {
    const [count, setCount] = useState(0);

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
  const renderer = new BinaryDOMRenderer(container);
  const counter = new Counter({});
  renderer.render(counter.render());
}
