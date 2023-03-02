import rabbitmq from 'amqplib';
import User, { UserRole } from '../models/User';

const RABBITMQ_HOST = process.env.RABBITMQ_HOST ?? '';
const EMAIL_QUEUE = process.env.RABBITMQ_EMAIL_QUEUE ?? '';

export interface Email {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(email: Email) {
  try {
    // Connect to RabbitMQ
    const connection = await rabbitmq.connect(RABBITMQ_HOST);
    const channel = await connection.createChannel();

    // Create the email queue
    await channel.assertQueue(EMAIL_QUEUE, {
      durable: true,
    });

    // Send the email to the queue
    await channel.sendToQueue(EMAIL_QUEUE, Buffer.from(JSON.stringify(email)), {
      persistent: true,
    });

    console.log('Email sent to queue:', email);

    // Close the connection
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('An error has occurred while trying to send an email.');
  }
}

export async function sendNewTaskEmailToManagers(
  techId: number,
  taskId: number,
  taskDate: Date,
) {
  const managers = await User.findAll({ where: { role: UserRole.Manager } });

  const subject = 'A new Task has started!';
  const text = `The tech with id ${techId} performed the task with id ${taskId} on date ${taskDate}.`;

  managers.map((managerData) => {
    const manager = managerData.dataValues;

    const email: Email = {
      from: process.env.NODEMAILER_USER ?? '',
      to: manager.email,
      subject: subject,
      text: text,
    };

    sendEmail(email);
  });
}
