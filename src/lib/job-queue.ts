import { logger, metrics } from "@/lib/monitoring";

export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  priority: number;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  scheduledAt?: Date;
}

export type JobHandler<T = any> = (job: Job<T>) => Promise<void>;

export class JobQueue {
  private static instance: JobQueue;
  private handlers: Map<string, JobHandler> = new Map();
  private queue: Job[] = [];
  private processing: boolean = false;
  private maxConcurrent: number = 5;
  private currentlyProcessing: number = 0;

  private constructor() {}

  static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  // Register a job handler
  register<T = any>(jobType: string, handler: JobHandler<T>): void {
    this.handlers.set(jobType, handler as JobHandler);
    logger.info("Job handler registered", { jobType });
  }

  // Add a job to the queue
  async add<T = any>(
    jobType: string,
    data: T,
    options: {
      priority?: number;
      maxRetries?: number;
      scheduledAt?: Date;
    } = {}
  ): Promise<string> {
    const job: Job<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: jobType,
      data,
      priority: options.priority || 0,
      retries: 0,
      maxRetries: options.maxRetries || 3,
      createdAt: new Date(),
      scheduledAt: options.scheduledAt,
    };

    this.queue.push(job);
    this.queue.sort((a, b) => b.priority - a.priority);

    logger.info("Job added to queue", {
      jobId: job.id,
      jobType,
      priority: job.priority,
    });

    metrics.increment("jobs.queued", 1, { type: jobType });

    // Start processing if not already running
    if (!this.processing) {
      this.process();
    }

    return job.id;
  }

  // Process jobs in the queue
  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.currentlyProcessing < this.maxConcurrent) {
      const job = this.queue.shift();
      if (!job) break;

      // Check if job should be delayed
      if (job.scheduledAt && job.scheduledAt > new Date()) {
        this.queue.push(job);
        continue;
      }

      this.currentlyProcessing++;
      this.executeJob(job);
    }

    // Check again after a delay
    setTimeout(() => {
      this.processing = false;
      if (this.queue.length > 0) {
        this.process();
      }
    }, 1000);
  }

  // Execute a single job
  private async executeJob(job: Job): Promise<void> {
    const startTime = Date.now();

    try {
      const handler = this.handlers.get(job.type);
      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      logger.info("Processing job", {
        jobId: job.id,
        jobType: job.type,
        retry: job.retries,
      });

      await handler(job);

      const duration = Date.now() - startTime;
      logger.info("Job completed successfully", {
        jobId: job.id,
        jobType: job.type,
        duration,
      });

      metrics.increment("jobs.completed", 1, { type: job.type });
      metrics.histogram("jobs.duration", duration, { type: job.type });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Job failed", error as Error, {
        jobId: job.id,
        jobType: job.type,
        retry: job.retries,
        duration,
      });

      // Retry logic
      if (job.retries < job.maxRetries) {
        job.retries++;
        job.scheduledAt = new Date(Date.now() + Math.pow(2, job.retries) * 1000);
        this.queue.push(job);

        logger.info("Job scheduled for retry", {
          jobId: job.id,
          retry: job.retries,
          scheduledAt: job.scheduledAt,
        });

        metrics.increment("jobs.retried", 1, { type: job.type });
      } else {
        logger.error("Job failed permanently", error as Error, {
          jobId: job.id,
          jobType: job.type,
          retries: job.retries,
        });

        metrics.increment("jobs.failed", 1, { type: job.type });
      }
    } finally {
      this.currentlyProcessing--;
    }
  }

  // Get queue status
  getStatus(): {
    queueLength: number;
    processing: number;
    registeredHandlers: string[];
  } {
    return {
      queueLength: this.queue.length,
      processing: this.currentlyProcessing,
      registeredHandlers: Array.from(this.handlers.keys()),
    };
  }
}

export const jobQueue = JobQueue.getInstance();

// Register common job handlers
jobQueue.register("send-email", async (job) => {
  const { emailService } = await import("@/lib/email-service");
  await emailService.send(job.data);
});

jobQueue.register("process-payment", async (job) => {
  const { paymentService } = await import("@/lib/payments");
  await paymentService.processPayment(job.data.paymentData, job.data.userId);
});

jobQueue.register("send-notification", async (job) => {
  logger.info("Sending notification", { data: job.data });
  // Implement notification logic (push notifications, SMS, etc.)
});
