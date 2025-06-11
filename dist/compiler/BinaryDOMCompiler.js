"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryDOMCompiler = void 0;
exports.createElement = createElement;
class BinaryDOMCompiler {
    constructor() { }
    static getInstance() {
        if (!BinaryDOMCompiler.instance) {
            BinaryDOMCompiler.instance = new BinaryDOMCompiler();
        }
        return BinaryDOMCompiler.instance;
    }
    compile(element) {
        if (typeof element === "string" || typeof element === "number") {
            return this.createTextNode(String(element));
        }
        if (!element || typeof element !== "object") {
            return this.createTextNode("");
        }
        const { type, props = {}, children = [] } = element;
        if (typeof type === "function") {
            return this.compileComponent(type, props);
        }
        return this.createElement(type, props, children);
    }
    createTextNode(value) {
        return {
            id: Math.random().toString(36).substring(2, 11),
            type: "text",
            props: {},
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
            value,
        };
    }
    createElement(type, props, children) {
        const node = {
            id: Math.random().toString(36).substring(2, 11),
            type: "element",
            tagName: type,
            props,
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
        // Process props
        Object.entries(props).forEach(([key, value]) => {
            if (key.startsWith("on") && typeof value === "function") {
                node.eventHandlers.set(key.toLowerCase(), value);
            }
            else if (key === "className") {
                node.attributes.set("class", String(value));
            }
            else if (key !== "children") {
                node.attributes.set(key, String(value));
            }
        });
        // Process children
        const compiledChildren = this.compileChildren(children);
        node.children = compiledChildren;
        // Set up binary tree structure
        if (compiledChildren.length > 0) {
            node.left = compiledChildren[0];
            node.left.parent = node;
            let current = node.left;
            for (let i = 1; i < compiledChildren.length; i++) {
                current.right = compiledChildren[i];
                current.right.parent = current;
                current = current.right;
            }
        }
        return node;
    }
    compileComponent(Component, props) {
        const instance = new Component(props);
        const result = instance.render();
        return this.compile(result);
    }
    compileChildren(children) {
        return children
            .flat()
            .filter((child) => child != null)
            .map((child) => this.compile(child));
    }
}
exports.BinaryDOMCompiler = BinaryDOMCompiler;
// JSX factory function
function createElement(type, props, ...children) {
    return BinaryDOMCompiler.getInstance().compile({ type, props, children });
}
