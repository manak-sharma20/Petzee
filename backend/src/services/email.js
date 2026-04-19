import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER) {
    console.log('[Email] Skipped (no EMAIL_USER configured):', subject);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Petzee <no-reply@petzee.app>',
    to,
    subject,
    html,
  });
};

// ── Templates ────────────────────────────────────────────────────

export const sendBookingConfirmationEmail = async (user, booking) => {
  await sendMail({
    to: user.email,
    subject: '🐾 Booking Received – Petzee',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width:560px; margin:auto; background:#f7f9fc; padding:32px; border-radius:16px;">
        <h2 style="color:#005e9a; margin-bottom:8px;">Hey ${user.name}! 👋</h2>
        <p style="color:#404751;">Your booking has been received and is <strong>pending confirmation</strong>.</p>
        <div style="background:#fff; border-radius:12px; padding:24px; margin:20px 0;">
          <p><strong>Service:</strong> ${booking.service?.title}</p>
          <p><strong>Pet:</strong> ${booking.pet?.name}</p>
          <p><strong>Scheduled:</strong> ${new Date(booking.scheduledAt).toLocaleString()}</p>
          <p><strong>Total:</strong> ₹${booking.totalPrice}</p>
        </div>
        <p style="color:#707882; font-size:14px;">You will receive another email once the provider confirms. Questions? Reply to this email.</p>
        <p style="color:#005e9a; font-weight:600; margin-top:24px;">– The Petzee Team 🐾</p>
      </div>
    `,
  });
};

export const sendVaccinationReminderEmail = async (user, pet, record) => {
  await sendMail({
    to: user.email,
    subject: `💉 Vaccination Reminder for ${pet.name} – Petzee`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width:560px; margin:auto; background:#f7f9fc; padding:32px; border-radius:16px;">
        <h2 style="color:#005e9a;">Time for ${pet.name}'s vaccination! 🐶</h2>
        <p style="color:#404751;">A vaccination is due soon for your pet.</p>
        <div style="background:#fff; border-radius:12px; padding:24px; margin:20px 0;">
          <p><strong>Pet:</strong> ${pet.name}</p>
          <p><strong>Vaccine:</strong> ${record.vaccineName}</p>
          <p><strong>Due Date:</strong> ${new Date(record.nextDueAt).toLocaleDateString()}</p>
        </div>
        <p style="color:#707882; font-size:14px;">Book a vet consultation through Petzee to keep ${pet.name} healthy!</p>
        <p style="color:#005e9a; font-weight:600; margin-top:24px;">– The Petzee Team 🐾</p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (user) => {
  await sendMail({
    to: user.email,
    subject: '🐾 Welcome to Petzee!',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width:560px; margin:auto; background:#f7f9fc; padding:32px; border-radius:16px;">
        <h2 style="color:#005e9a;">Welcome to Petzee, ${user.name}! 🎉</h2>
        <p style="color:#404751;">We're thrilled to have you and your furry friends on board.</p>
        <p style="color:#404751;">Get started by adding your pet and exploring services near you.</p>
        <div style="text-align:center; margin:28px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="background:linear-gradient(135deg,#005e9a,#0077c2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:600;display:inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p style="color:#005e9a; font-weight:600;">– The Petzee Team 🐾</p>
      </div>
    `,
  });
};
