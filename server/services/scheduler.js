import cron from 'node-cron';
import { addDays, addWeeks, addMonths } from 'date-fns';
import Schedule from '../models/Schedule.js';
import { evolutionApi } from './evolutionApi.js';

const jobs = new Map();

export const addJob = (schedule) => {
  const jobId = schedule._id.toString();
  
  // Remove existing job if any
  if (jobs.has(jobId)) {
    removeJob(jobId);
  }

  // Create cron expression based on schedule time
  const date = new Date(schedule.scheduledTime);
  const cronExpression = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;

  const job = cron.schedule(cronExpression, async () => {
    try {
      // Send message
      if (schedule.type === 'text') {
        await evolutionApi.sendMessage(schedule.instanceName, schedule.chatId, {
          type: 'text',
          content: schedule.content,
        });
      } else {
        await evolutionApi.sendFile(
          schedule.instanceName,
          schedule.chatId,
          schedule.fileUrl,
          schedule.caption
        );
      }

      // Update schedule status
      schedule.status = 'sent';
      schedule.lastRun = new Date();

      // Handle recurring schedules
      if (schedule.repeat !== 'none') {
        let nextRun;
        switch (schedule.repeat) {
          case 'daily':
            nextRun = addDays(schedule.lastRun, 1);
            break;
          case 'weekly':
            nextRun = addWeeks(schedule.lastRun, 1);
            break;
          case 'monthly':
            nextRun = addMonths(schedule.lastRun, 1);
            break;
        }
        schedule.nextRun = nextRun;
        schedule.scheduledTime = nextRun;
        
        // Create new job for next run
        addJob(schedule);
      }

      await schedule.save();
    } catch (error) {
      console.error('Error executing scheduled message:', error);
      schedule.status = 'failed';
      await schedule.save();
    }
  });

  jobs.set(jobId, job);
};

export const removeJob = (jobId) => {
  const job = jobs.get(jobId);
  if (job) {
    job.stop();
    jobs.delete(jobId);
  }
};

// Initialize scheduler with existing schedules
export const initializeScheduler = async () => {
  try {
    const schedules = await Schedule.find({ status: 'pending' });
    schedules.forEach(addJob);
    console.log(`Initialized scheduler with ${schedules.length} jobs`);
  } catch (error) {
    console.error('Error initializing scheduler:', error);
  }
};