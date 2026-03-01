const Setting = require('../models/Setting');
const EmailLog = require('../models/EmailLog');
const nodemailer = require('nodemailer');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        // Convert to object { key: value }
        const settingsMap = {};
        settings.forEach(s => settingsMap[s.key] = s.value);
        res.json(settingsMap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        let setting = await Setting.findOne({ where: { key } });

        if (setting) {
            setting.value = value.toString();
            await setting.save();
        } else {
            await Setting.create({ key, value: value.toString() });
        }

        res.json({ message: 'Setting updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.testEmailConfig = async (req, res) => {
    try {
        const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, test_email } = req.body;

        if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !smtp_from || !test_email) {
            return res.status(400).json({ message: 'Missing parameters for test email' });
        }

        const transporter = nodemailer.createTransport({
            host: smtp_host,
            port: Number(smtp_port),
            secure: Number(smtp_port) === 465, // true for 465, false for other ports
            auth: {
                user: smtp_user,
                pass: smtp_pass,
            },
        });

        const mailOptions = {
            from: smtp_from,
            to: test_email,
            subject: 'Test Email from Boletera Admin System',
            html: `
                <h3>Configuration Test Successful</h3>
                <p>If you are receiving this email, it means your SMTP settings in the Boletera Admin Panel are correct.</p>
                <br>
                <small>Host: ${smtp_host}:${smtp_port}</small>
            `,
        };

        await transporter.sendMail(mailOptions);

        await EmailLog.create({
            toEmail: test_email,
            subject: 'Test Email from Boletera Admin System',
            type: 'Test',
            status: 'Sent',
            error: null
        });

        res.json({ message: 'Test email sent successfully' });

    } catch (error) {
        console.error('Test Email failed:', error);

        await EmailLog.create({
            toEmail: req.body.test_email || 'Unknown',
            subject: 'Test Email from Boletera Admin System',
            type: 'Test',
            status: 'Failed',
            error: error.message
        });

        res.status(500).json({ message: 'Test email failed to send', error: error.message });
    }
};

exports.getEmailLogs = async (req, res) => {
    try {
        const query = {};
        if (req.query.type) query.type = req.query.type;
        if (req.query.status) query.status = req.query.status;

        const logs = await EmailLog.findAll({
            where: query,
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching email logs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
