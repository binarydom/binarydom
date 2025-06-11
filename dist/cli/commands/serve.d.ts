interface ServeOptions {
    port: string;
    host: string;
}
export declare function serve(options: ServeOptions): Promise<void>;
export {};
