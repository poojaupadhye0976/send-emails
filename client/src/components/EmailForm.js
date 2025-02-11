import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Papa from "papaparse";

const EmailForm = () => {
  // Single Email State
  const [singleEmailData, setSingleEmailData] = useState({
    to: "",
    subject: "",
    text: "",
  });

  // Bulk Email (Same Message) State
  const [bulkEmailData, setBulkEmailData] = useState({
    subject: "",
    text: "",
  });

  // Bulk Email (Different Messages) CSV File State
  const [csvFile, setCsvFile] = useState(null);

  const [csvEmails, setCsvEmails] = useState([]);

  // Handle Input Changes
  const handleSingleEmailChange = (e) => {
    setSingleEmailData({ ...singleEmailData, [e.target.name]: e.target.value });
  };

  const handleBulkEmailChange = (e) => {
    setBulkEmailData({ ...bulkEmailData, [e.target.name]: e.target.value });
  };

  // Handle CSV File Upload for Bulk (Same Message)
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const emails = result.data.flat().filter((email) => email.includes("@"));
          setCsvEmails(emails);
          alert(`${emails.length} emails loaded from CSV`);
        },
      });
    }
  };

  // Handle CSV File Upload for Bulk (Different Messages)
  const handleCSVUploadForCustom = (e) => {
    setCsvFile(e.target.files[0]);
  };

  // Send Single Email
  const sendSingleEmail = async () => {
    try {
      const response = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleEmailData),
      });

      const data = await response.json();
      alert(response.ok ? data.message : "Email failed to send.");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("An error occurred.");
    }
  };

  // Send Bulk Emails (Same Message)
  const sendBulkEmails = async () => {
    if (csvEmails.length === 0) {
      alert("Please upload a valid CSV file with emails.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/send-bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: csvEmails,
          subject: bulkEmailData.subject,
          text: bulkEmailData.text,
        }),
      });

      const data = await response.json();
      alert(response.ok ? data.message : "Bulk email failed to send.");
    } catch (error) {
      console.error("Error sending bulk email:", error);
      alert("An error occurred.");
    }
  };

  // Send Bulk Emails (Different Messages via CSV)
  const sendBulkCustomEmails = async () => {
    if (!csvFile) {
      alert("Please upload a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await fetch("http://localhost:5000/send-csv-emails", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(response.ok ? data.message : "Bulk custom email sent successfully");
    } catch (error) {
      console.error("Error sending custom bulk emails:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        {/* Single Email Form */}
        <div className="col-md-4">
          <div className="card p-4 shadow-lg">
            <h2 className="text-center mb-4">Send Single Email</h2>
            <input type="email" name="to" className="form-control mb-3" placeholder="Recipient Email" onChange={handleSingleEmailChange} />
            <input type="text" name="subject" className="form-control mb-3" placeholder="Subject" onChange={handleSingleEmailChange} />
            <textarea name="text" className="form-control mb-3" placeholder="Message" rows="3" onChange={handleSingleEmailChange}></textarea>
            <button className="btn btn-primary w-100" onClick={sendSingleEmail}>Send Email</button>
          </div>
        </div>

        {/* Bulk Email (Same Message) Form */}
        <div className="col-md-4">
          <div className="card p-4 shadow-lg">
            <h2 className="text-center mb-4">Same Bulk Emails</h2>
            <input type="text" name="subject" className="form-control mb-3" placeholder="Subject" onChange={handleBulkEmailChange} />
            <textarea name="text" className="form-control mb-3" placeholder="Message" rows="3" onChange={handleBulkEmailChange}></textarea>
            <input type="file" accept=".csv" className="form-control mb-3" onChange={handleCSVUpload} />
            <button className="btn btn-success w-100" onClick={sendBulkEmails}>Send Bulk Emails</button>
          </div>
        </div>

        {/* Bulk Email (Different Messages) Form */}
        <div className="col-md-4">
          <div className="card p-4 shadow-lg">
            <h2 className="text-center mb-4">Different Bulk Emails</h2>
            <input type="file" accept=".csv" className="form-control mb-3" onChange={handleCSVUploadForCustom} />
            <button className="btn btn-danger w-100" onClick={sendBulkCustomEmails}>Send Custom Emails</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailForm;

