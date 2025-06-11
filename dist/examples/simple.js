"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryDOM_1 = require("../BinaryDOM");
async function runExample() {
    // Create a simple DOM structure
    const container = document.createElement("div");
    container.innerHTML = `
    <div class="parent">
      <h1>Hello Binary DOM</h1>
      <p>This is a test</p>
    </div>
  `;
    // Initialize Binary DOM
    const binaryDOM = new BinaryDOM_1.BinaryDOM({
        useChecksums: true,
        batchUpdates: true,
        maxBatchSize: 100,
    });
    await binaryDOM.initialize();
    binaryDOM.mount(container);
    // Simulate an update
    setTimeout(() => {
        container.querySelector("p").textContent = "Updated content";
        const newTree = binaryDOM.buildBinaryTree(container);
        const changes = binaryDOM.diff(binaryDOM.root, newTree);
        binaryDOM.patch(changes);
    }, 1000);
}
// Run the example
runExample().catch(console.error);
