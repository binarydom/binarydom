import { BinaryDOMNode } from "../types/BinaryDOMNode";
import { BinaryDOMComponent } from "../BinaryDOMComponent";
interface SuspenseProps {
    fallback: BinaryDOMNode;
    children: BinaryDOMNode;
}
interface SuspenseState {
    isLoading: boolean;
    error: Error | null;
}
export declare class Suspense extends BinaryDOMComponent<SuspenseProps, SuspenseState> {
    constructor(props: SuspenseProps);
    componentDidMount(): Promise<void>;
    private loadChildren;
    render(): BinaryDOMNode;
    update(newElement: BinaryDOMNode): void;
}
export declare function lazy(loader: () => Promise<any>): {
    type: string;
    props: {
        load: () => Promise<void>;
        render: (props: any) => {
            type: string;
            props: any;
            children: any[];
        };
    };
};
export {};
