interface BuildOptions {
    outDir: string;
    minify: boolean;
}
export declare function build(options: BuildOptions): Promise<void>;
export {};
