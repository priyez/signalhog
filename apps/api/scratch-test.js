const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  try {
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && typeof prisma[k] === 'object'));
    if (prisma.session) {
      console.log('prisma.session is defined');
    } else {
      console.error('prisma.session is NOT defined');
    }
  } catch (e) {
    console.error('Test failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
