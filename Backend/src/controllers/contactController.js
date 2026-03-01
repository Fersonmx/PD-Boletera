const nodemailer = require('nodemailer');
const { Page, Setting } = require('../models');

// We will no longer use a global transporter.
// It will be instantiated dynamically per request so settings take immediate effect.

exports.sendContactForm = async (req, res) => {
    try {
        const { slug } = req.params;
        const formData = req.body;

        // Find the page to get configuration
        const page = await Page.findOne({ where: { slug } });

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        if (!page.includeContactForm) {
            return res.status(400).json({ message: 'Contact form is not enabled for this page' });
        }

        const notifyEmail = page.notifyEmail || process.env.DEFAULT_CONTACT_EMAIL || 'admin@example.com';

        // Construct email content
        const fields = Object.entries(formData).map(([key, value]) => `<b>${key}:</b> ${value}`).join('<br>');

        // Fetch Dynamic Settings
        const settings = await Setting.findAll({
            where: {
                key: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from']
            }
        });

        const settingsMap = {};
        settings.forEach(s => settingsMap[s.key] = s.value);

        // Fallbacks to env variables if DB settings are missing
        const smtpHost = settingsMap['smtp_host'] || process.env.SMTP_HOST;
        const smtpPort = settingsMap['smtp_port'] || process.env.SMTP_PORT || 587;
        const smtpUser = settingsMap['smtp_user'] || process.env.SMTP_USER;
        const smtpPass = settingsMap['smtp_pass'] || process.env.SMTP_PASS;
        const smtpFrom = settingsMap['smtp_from'] || process.env.SMTP_FROM || '"Boletera Contact" <noreply@boletera.com>';

        const mailOptions = {
            from: smtpFrom,
            to: notifyEmail,
            subject: `New Contact Form Submission: ${page.title}`,
            html: `
                <h3>New submission from ${page.title}</h3>
                <p>You have received a new message:</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
                    ${fields}
                </div>
            `,
        };

        // Send Email
        // Only send if SMTP User is configured, otherwise log it (Mock for dev)
        if (smtpUser) {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: Number(smtpPort),
                secure: Number(smtpPort) === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${notifyEmail}`);
        } else {
            console.log(`[MOCK EMAIL] To: ${notifyEmail}`);
            console.log(`[MOCK EMAIL] Data:`, formData);
        }

        res.json({ message: 'Message sent successfully' });

    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};
