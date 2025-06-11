"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Portal = void 0;
const BinaryDOMRenderer_1 = require("../BinaryDOMRenderer");
class Portal {
    static initialize(renderer) {
        this.renderer = renderer;
    }
    static createPortal(node, container) {
        const containerElement = typeof container === "string"
            ? document.getElementById(container)
            : container;
        if (!containerElement) {
            throw new Error("Portal container not found");
        }
        const portalId = Math.random().toString(36).substring(2, 11);
        this.portals.set(portalId, containerElement);
        // Create a portal node
        const portalNode = {
            id: portalId,
            type: "portal",
            props: {},
            attributes: new Map(),
            children: [node],
            left: null,
            right: null,
            parent: null,
            checksum: 0,
            isDirty: false,
            eventHandlers: new Map(),
            state: null,
            hooks: [],
            portalContainer: containerElement,
        };
        return portalNode;
    }
    static renderPortal(portalNode) {
        const container = this.portals.get(portalNode.id);
        if (!container)
            return;
        // Create a new renderer for the portal
        const portalRenderer = new BinaryDOMRenderer_1.BinaryDOMRenderer(container);
        portalRenderer.render(portalNode.children[0]);
    }
    static removePortal(portalId) {
        const container = this.portals.get(portalId);
        if (container) {
            container.innerHTML = "";
            this.portals.delete(portalId);
        }
    }
}
exports.Portal = Portal;
Portal.portals = new Map();
