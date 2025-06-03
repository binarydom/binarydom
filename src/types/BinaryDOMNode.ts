export type NodeType = "element" | "text" | "comment" | "document" | "fragment";

export interface BinaryDOMProps {
  [key: string]: any;
  children?: BinaryDOMNode[];
  key?: string | number;
  ref?: (node: any) => void;
  style?: { [key: string]: string | number };
  className?: string;
  dangerouslySetInnerHTML?: { __html: string };
}

export interface BinaryDOMNode {
  id: string;
  type: NodeType;
  tagName?: string;
  props: BinaryDOMProps;
  attributes: Map<string, string>;
  children: BinaryDOMNode[];
  left: BinaryDOMNode | null;
  right: BinaryDOMNode | null;
  checksum: number;
  isDirty: boolean;
  parent: BinaryDOMNode | null;
  value?: string;
  key?: string | number;
  ref?: (node: any) => void;
  eventHandlers: Map<string, Function>;
  state: any;
  hooks: any[];
  fiber?: {
    alternate: BinaryDOMNode | null;
    child: BinaryDOMNode | null;
    sibling: BinaryDOMNode | null;
    return: BinaryDOMNode | null;
    pendingProps: BinaryDOMProps;
    memoizedProps: BinaryDOMProps;
    memoizedState: any;
    updateQueue: any;
    flags: number;
  };
  alternate?: BinaryDOMNode | null;
  child?: BinaryDOMNode | null;
  sibling?: BinaryDOMNode | null;
  return?: BinaryDOMNode | null;
  effectTag?: string;
  dom?: HTMLElement | Text | null;
}

export interface BinaryDOMOptions {
  useChecksums?: boolean;
  batchUpdates?: boolean;
  maxBatchSize?: number;
}
