import rabbitmq from 'amqplib';
import nodemailer from 'nodemailer';

const RABBITMQ_HOST = process.env.RABBITMQ_HOST ?? '';
const EMAIL_QUEUE = process.env.RABBITMQ_EMAIL_QUEUE ?? '';
const EMAIL_HOST = process.env.NODEMAILER_HOST ?? '';
const EMAIL_PORT = parseInt(process.env.NODEMAILER_PORT ?? '');
const EMAIL_USER = process.env.NODEMAILER_USER ?? '';
const EMAIL_PASS = process.env.NODEMAILER_PASSWORD ?? '';

export async function startEmailConsumer() {
  try {
    // Connect to RabbitMQ
    const connection = await rabbitmq.connect(RABBITMQ_HOST);
    const channel = await connection.createChannel();

    // Create the email queue
    await channel.assertQueue(EMAIL_QUEUE, { durable: true });

    // Consume messages from the queue
    await channel.consume(EMAIL_QUEUE, async (data) => {
      if (!data) return;

      const email = JSON.parse(data.content.toString());

      try {
        // Send the email
        const transporter = nodemailer.createTransport({
          host: EMAIL_HOST,
          port: EMAIL_PORT,
          secure: true,
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
          },
        });

        await transporter.sendMail(email);

        console.log('Email sent:', email);

        // Acknowledge the message
        channel.ack(data);
      } catch (error) {
        console.error('Error sending email:', error);

        // Reject the message and requeue it
        channel.nack(data, false, true);
      }
    });
  } catch (error) {
    console.error('Error starting consumer:', error);
  }
}
