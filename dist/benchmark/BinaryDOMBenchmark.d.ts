export declare class BinaryDOMBenchmark {
    private renderer;
    private container;
    private results;
    constructor(container: HTMLElement);
    runBenchmark(iterations?: number): Promise<void>;
    private measureInitialRender;
    private measureUpdatePerformance;
    private measureMemoryUsage;
    private measureReconciliation;
    private createTestElement;
    private printResults;
}
