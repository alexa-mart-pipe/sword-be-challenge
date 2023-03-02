import cron from 'node-cron';

cron.schedule('*/10 * * * *', () => {
  console.log('Task is running every minute ' + new Date());
});
