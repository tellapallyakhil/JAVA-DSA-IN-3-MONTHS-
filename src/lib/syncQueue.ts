
/**
 * Professional Asynchronous Task Queue
 * Ensures that all progress updates are processed sequentially.
 * Prevents "Database Lock" and "Race Conditions" in high-concurrency environments.
 */

type Task = {
    id: string;
    execute: () => Promise<void>;
    retryCount: number;
    timestamp: number;
};

class SyncQueue {
    private queue: Task[] = [];
    private isProcessing = false;
    private maxRetries = 3;

    /**
     * Add a task to the queue with a priority signature.
     * If a task with the same ID already exists (e.g., multiple "Two Sum" updates),
     * we replace the old one with the latest data to optimize throughput.
     */
    async enqueue(id: string, execute: () => Promise<void>) {
        // Remove existing task with same ID to ensure we only sync the latest state
        this.queue = this.queue.filter(t => t.id !== id);

        const task: Task = {
            id,
            execute,
            retryCount: 0,
            timestamp: Date.now()
        };

        this.queue.push(task);
        this.process();
    }

    private async process() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const task = this.queue[0];

        try {
            console.log(`[QUEUE] Executing task: ${task.id}`);
            await task.execute();
            this.queue.shift(); // Success, remove from queue
            console.log(`[QUEUE] Task ${task.id} success.`);
        } catch (error) {
            console.error(`[QUEUE] Task ${task.id} failed:`, error);
            task.retryCount++;

            if (task.retryCount > this.maxRetries) {
                console.error(`[QUEUE] Task ${task.id} exceeded max retries. Dropping.`);
                this.queue.shift();
            } else {
                // Exponential backoff
                const delay = Math.pow(2, task.retryCount) * 1000;
                await new Promise(r => setTimeout(r, delay));
            }
        } finally {
            this.isProcessing = false;
            // Immediate recurse for next task
            this.process();
        }
    }

    getQueueLength() {
        return this.queue.length;
    }
}

export const progressSyncQueue = new SyncQueue();
