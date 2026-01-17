// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587,
//   secure: false,
//   requireTLS: true, // 🔥 REQUIRED for Brevo
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// module.exports = async (to, subject, text) => {
//   try {
//     console.log("📨 Sending email to:", to);

//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to,
//       subject,
//       text,
//     });

//     console.log("✅ Email sent successfully:", info.response);
//   } catch (error) {
//     console.error("❌ Email failed FULL ERROR:", error);
//     throw error;
//   }
// };



const axios = require("axios");

module.exports = async (to, subject, text) => {
  try {
    console.log("📨 Sending email to:", to);

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Digital Business",
          email: "amolikakale234@gmail.com", // works without domain auth
        },
        to: [{ email: to }],
        subject,
        textContent: text,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent via Brevo API:", response.data.messageId);
  } catch (error) {
    console.error(
      "❌ Brevo API email failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
