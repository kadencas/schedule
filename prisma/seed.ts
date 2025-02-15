import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Create a company first
  const company = await prisma.companies.create({
    data: {
      name: 'Tech Corp',
    },
  });

  // Create a user
  const user = await prisma.users.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'EMPLOYEE',
      companyId: company.id,
      department: 'Engineering',
      location: 'New York',
    },
  });

  // Create a work shift
  const today = new Date();
  const startTime = new Date(today);
  startTime.setHours(9, 0, 0, 0); // 9 AM
  const endTime = new Date(today);
  endTime.setHours(17, 0, 0, 0); // 5 PM

  const workShift = await prisma.work_shifts.create({
    data: {
      userId: user.id,
      companyId: company.id,
      shiftDate: today,
      startTime: startTime,
      endTime: endTime,
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
      notes: 'Regular work schedule',
      segments: {
        create: [
          {
            segmentType: 'meeting',
            location: 'Conference Room A',
            startTime: new Date(startTime.setHours(10, 0)), // 10 AM
            endTime: new Date(startTime.setHours(11, 0)), // 11 AM
            notes: 'Daily standup',
          },
          {
            segmentType: 'lunch',
            location: 'Break Room',
            startTime: new Date(startTime.setHours(12, 0)), // 12 PM
            endTime: new Date(startTime.setHours(13, 0)), // 1 PM
            notes: 'Lunch break',
          },
          {
            segmentType: 'deepwork',
            location: 'Desk',
            startTime: new Date(startTime.setHours(14, 0)), // 2 PM
            endTime: new Date(startTime.setHours(16, 0)), // 4 PM
            notes: 'Focus time',
          },
        ],
      },
    },
    include: {
      segments: true,
    },
  });

  console.log('Created mock data:');
  console.log('Company:', company);
  console.log('User:', user);
  console.log('Work Shift:', workShift);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
