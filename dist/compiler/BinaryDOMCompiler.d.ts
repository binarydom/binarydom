import { BinaryDOMNode } from "../types/BinaryDOMNode";
export declare class BinaryDOMCompiler {
    private static instance;
    private constructor();
    static getInstance(): BinaryDOMCompiler;
    compile(element: any): BinaryDOMNode;
    private createTextNode;
    private createElement;
    private compileComponent;
    private compileChildren;
}
export declare function createElement(type: string | Function, props: any, ...children: any[]): BinaryDOMNode;
