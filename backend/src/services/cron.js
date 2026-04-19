import cron from 'node-cron';
import prisma from '../utils/prisma.js';
import { sendVaccinationReminderEmail } from './email.js';

export const startCronJobs = () => {
  // ── Daily at 08:00: Vaccination reminders ─────────────────────
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running vaccination reminder job...');
    try {
      const today = new Date();
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);

      const dueRecords = await prisma.vaccinationRecord.findMany({
        where: {
          nextDueAt: {
            gte: today,
            lte: sevenDaysLater,
          },
        },
        include: {
          pet: {
            include: { owner: true },
          },
        },
      });

      console.log(`[Cron] Found ${dueRecords.length} vaccination(s) due within 7 days`);

      for (const record of dueRecords) {
        const { pet } = record;
        const { owner } = pet;

        // In-app notification
        await prisma.notification.upsert({
          where: {
            // Use a stable identifier to prevent duplicate notifications
            id: `vax-cron-${record.id}-${today.toISOString().split('T')[0]}`,
          },
          update: {},
          create: {
            id: `vax-cron-${record.id}-${today.toISOString().split('T')[0]}`,
            userId: owner.id,
            type: 'VACCINATION_REMINDER',
            title: `Vaccination due for ${pet.name}`,
            message: `${record.vaccineName} is due on ${new Date(record.nextDueAt).toLocaleDateString()}`,
            metadata: { petId: pet.id, vaccinationId: record.id },
          },
        });

        // Email reminder
        await sendVaccinationReminderEmail(owner, pet, record).catch(console.error);
      }
    } catch (err) {
      console.error('[Cron] Vaccination job error:', err);
    }
  });

  // ── Weekly on Monday 09:00: Unread notification digest ────────
  cron.schedule('0 9 * * 1', async () => {
    console.log('[Cron] Running unread notification digest...');
    try {
      const users = await prisma.user.findMany({
        where: { notifications: { some: { isRead: false } } },
        include: {
          notifications: { where: { isRead: false }, orderBy: { createdAt: 'desc' }, take: 5 },
        },
      });
      console.log(`[Cron] Digest: ${users.length} users with unread notifications`);
      // Email digest could be implemented here
    } catch (err) {
      console.error('[Cron] Digest job error:', err);
    }
  });

  console.log('[Cron] Jobs scheduled ✓');
};
