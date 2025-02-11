require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");
const Papa = require("papaparse");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Multer setup for CSV file uploads
const upload = multer({ dest: "uploads/" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send a single email
app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;
  console.log("Received data:", req.body); // Debugging

  if (!to || !subject || !text) {
    return res.status(400).json({ message: "Recipient, subject, and message are required" });
  }

  try {
    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Email failed to send" });
  }
});

// ✅ Send bulk emails (same message to multiple recipients)
app.post("/send-bulk-email", async (req, res) => {
  const { emails, subject, text } = req.body;
  console.log("Bulk Email Data:", req.body); // Debugging

  if (!emails || emails.length === 0) {
    return res.status(400).json({ message: "No emails provided" });
  }
  if (!subject || !text) {
    return res.status(400).json({ message: "Subject and text are required" });
  }

  try {
    const sendPromises = emails.map((email) =>
      transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text,
      })
    );

    await Promise.all(sendPromises);
    res.status(200).json({ message: "Bulk emails sent successfully!" });
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    res.status(500).json({ message: "Bulk email failed to send" });
  }
});

// ✅ Send different emails to multiple users from CSV
app.post("/send-csv-emails", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file is required" });
  }

  const filePath = req.file.path;
  const csvData = fs.readFileSync(filePath, "utf8");
  
  // Parse CSV file
  Papa.parse(csvData, {
    header: true,
    complete: async (result) => {
      fs.unlinkSync(filePath); // Remove uploaded file

      if (!result.data || result.data.length === 0) {
        return res.status(400).json({ message: "CSV file is empty or invalid" });
      }

      try {
        const emailPromises = result.data.map(({ email, subject, text }) =>
          transporter.sendMail({
            from: `"Your App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text,
          })
        );

        await Promise.all(emailPromises);
        res.status(200).json({ message: "CSV emails sent successfully!" });
      } catch (error) {
        console.error("Error sending CSV emails:", error);
        res.status(500).json({ message: "CSV email sending failed" });
      }
    },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
