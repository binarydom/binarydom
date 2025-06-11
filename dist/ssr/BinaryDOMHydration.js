"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryDOMHydration = void 0;
class BinaryDOMHydration {
    constructor(renderer) {
        this.renderer = renderer;
    }
    static getInstance(renderer) {
        if (!this.instance) {
            this.instance = new BinaryDOMHydration(renderer);
        }
        return this.instance;
    }
    hydrate(node, container) {
        const existingNodes = this.findExistingNodes(container);
        this.hydrateNode(node, container, existingNodes);
    }
    hydrateNode(node, parentElement, existingNodes) {
        const existingElement = existingNodes.get(node.id);
        if (existingElement) {
            // Update attributes and props
            this.updateAttributes(existingElement, node);
            this.updateProps(existingElement, node);
            // Hydrate children
            const childElements = Array.from(existingElement.children);
            node.children.forEach((child, index) => {
                if (childElements[index]) {
                    this.hydrateNode(child, existingElement, existingNodes);
                }
                else {
                    // Create new element if it doesn't exist
                    const newElement = this.renderer.createElement(child);
                    existingElement.appendChild(newElement);
                }
            });
            // Remove extra elements
            while (existingElement.children.length > node.children.length) {
                existingElement.removeChild(existingElement.lastChild);
            }
        }
        else {
            // Create new element if it doesn't exist
            const newElement = this.renderer.createElement(node);
            parentElement.appendChild(newElement);
        }
    }
    findExistingNodes(container) {
        const nodes = new Map();
        const elements = container.querySelectorAll("[data-binary-id]");
        elements.forEach((element) => {
            const id = element.getAttribute("data-binary-id");
            if (id) {
                nodes.set(id, element);
            }
        });
        return nodes;
    }
    updateAttributes(element, node) {
        // Remove all existing attributes
        Array.from(element.attributes).forEach((attr) => {
            if (!attr.name.startsWith("data-binary-")) {
                element.removeAttribute(attr.name);
            }
        });
        // Add new attributes
        node.attributes.forEach((value, key) => {
            element.setAttribute(key, value);
        });
    }
    updateProps(element, node) {
        // Update props from data attributes
        Array.from(element.attributes)
            .filter((attr) => attr.name.startsWith("data-prop-"))
            .forEach((attr) => {
            const propName = attr.name.replace("data-prop-", "");
            try {
                const value = JSON.parse(attr.value);
                element[propName] = value;
            }
            catch (e) {
                console.warn(`Failed to parse prop ${propName}:`, e);
            }
        });
    }
}
exports.BinaryDOMHydration = BinaryDOMHydration;
