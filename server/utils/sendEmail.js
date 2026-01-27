import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReminderEmail = async (to, movieTitle) => {
  await transporter.sendMail({
    from: `"SceneIt 🎬" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🎬 Movie Reminder from SceneIt",
    html: `<h2>Don't forget to watch <b>${movieTitle}</b> today! 🍿</h2>`,
  });
};
