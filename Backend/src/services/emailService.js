const nodemailer = require('nodemailer');
const { Setting, EmailLog } = require('../models');

class EmailService {
    async getTransporter() {
        const settings = await Setting.findAll({
            where: {
                key: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from']
            }
        });

        const settingsMap = {};
        settings.forEach(s => settingsMap[s.key] = s.value);

        const host = settingsMap['smtp_host'] || process.env.SMTP_HOST;
        const port = settingsMap['smtp_port'] || process.env.SMTP_PORT || 587;
        const user = settingsMap['smtp_user'] || process.env.SMTP_USER;
        const pass = settingsMap['smtp_pass'] || process.env.SMTP_PASS;
        this.from = settingsMap['smtp_from'] || process.env.SMTP_FROM || '"Boletera" <noreply@boletera.com>';

        if (!user) {
            console.warn('[EmailService] SMTP User not configured. Emails will only be logged.');
            return null;
        }

        return nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465,
            auth: {
                user,
                pass,
            },
        });
    }

    async sendEmail(to, subject, html, type = 'Other') {
        try {
            const transporter = await this.getTransporter();
            if (!transporter) {
                console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
                console.log(`[MOCK EMAIL] HTML: ${html}`);
                return true;
            }

            const mailOptions = {
                from: this.from,
                to,
                subject,
                html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`[EmailService] Email sent to ${to}: ${info.messageId}`);

            // Log Success
            await EmailLog.create({
                toEmail: to,
                subject: subject,
                type: type,
                status: 'Sent',
                error: null
            });

            return true;
        } catch (error) {
            console.error('[EmailService] Error sending email:', error);

            // Log Failure
            await EmailLog.create({
                toEmail: to,
                subject: subject,
                type: type,
                status: 'Failed',
                error: error.message
            });

            return false;
        }
    }

    async sendOrderConfirmation(order, userEmail, itemsSummary, language = 'es') {
        const settings = await Setting.findAll({
            where: {
                key: [`order_email_subject_${language}`, `order_email_body_${language}`]
            }
        });

        const settingsMap = {};
        settings.forEach(s => settingsMap[s.key] = s.value);

        let fallbackSubject, fallbackBody;
        if (language === 'en') {
            fallbackSubject = `Order Confirmation - Order #${order.id}`;
            fallbackBody = `<p>Hello,</p><p>We received your payment and your order <strong>#${order.id}</strong> is confirmed.</p>`;
        } else {
            fallbackSubject = `Confirmación de Compra - Orden #${order.id}`;
            fallbackBody = `<p>Hola,</p><p>Hemos recibido tu pago y tu orden <strong>#${order.id}</strong> está confirmada.</p>`;
        }

        const subject = settingsMap[`order_email_subject_${language}`] || fallbackSubject;
        let body = settingsMap[`order_email_body_${language}`] || fallbackBody;

        body = body.replace(/{{orderId}}/g, order.id);
        body = body.replace(/{{total}}/g, order.totalAmount);

        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #1A1A2E; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">${subject}</h2>
                </div>
                <div style="padding: 20px;">
                    ${body}
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">${language === 'en' ? 'Order Details' : 'Detalles de la Orden'}</h3>
                    <p>${itemsSummary}</p>
                    <p style="font-size: 16px; font-weight: bold;">Total: $${order.totalAmount}</p>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL}/profile/orders" style="background-color: #e50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">${language === 'en' ? 'View My Tickets' : 'Ver mis boletos'}</a>
                    </div>
                </div>
            </div>
        `;

        return this.sendEmail(userEmail, subject, html, 'Order');
    }

    async sendPasswordRecovery(userEmail, resetToken, language = 'es') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        const settings = await Setting.findAll({
            where: {
                key: [`recovery_email_subject_${language}`, `recovery_email_body_${language}`]
            }
        });

        const settingsMap = {};
        settings.forEach(s => settingsMap[s.key] = s.value);

        let fallbackSubject, fallbackBody;
        if (language === 'en') {
            fallbackSubject = 'Password Recovery';
            fallbackBody = `<p>Hello,</p><p>We received a request to reset your password.</p><p>Click the link below. It expires in 1 hour.</p>`;
        } else {
            fallbackSubject = 'Recuperación de Contraseña';
            fallbackBody = `<p>Hola,</p><p>Recibimos una solicitud para restablecer tu contraseña.</p><p>Haz clic en el enlace. Expirará en 1 hora.</p>`;
        }

        const subject = settingsMap[`recovery_email_subject_${language}`] || fallbackSubject;
        let body = settingsMap[`recovery_email_body_${language}`] || fallbackBody;

        body = body.replace(/{{link}}/g, resetLink);

        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #1A1A2E; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">${subject}</h2>
                </div>
                <div style="padding: 20px;">
                    ${body}
                    <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                        <a href="${resetLink}" style="background-color: #e50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">${language === 'en' ? 'Reset Password' : 'Restablecer Contraseña'}</a>
                    </div>
                </div>
            </div>
        `;

        return this.sendEmail(userEmail, subject, html, 'PasswordRecovery');
    }

    async sendWelcomeEmail(userEmail, userName, language = 'es') {
        const settings = await Setting.findAll({
            where: {
                key: [`welcome_email_subject_${language}`, `welcome_email_body_${language}`, 'welcome_email_subject', 'welcome_email_body']
            }
        });

        const settingsMap = {};
        settings.forEach(s => settingsMap[s.key] = s.value);

        let fallbackSubject, fallbackBody;
        if (language === 'en') {
            fallbackSubject = 'Welcome to Boletera!';
            fallbackBody = `Hello {{name}}, thank you for registering with {{email}}. We are happy to have you here!`;
        } else {
            fallbackSubject = '¡Bienvenido a Boletera!';
            fallbackBody = `Hola {{name}}, gracias por registrarte con el correo {{email}} en Boletera. ¡Estamos felices de tenerte aquí!`;
        }

        const subject = settingsMap[`welcome_email_subject_${language}`] || settingsMap['welcome_email_subject'] || fallbackSubject;
        let body = settingsMap[`welcome_email_body_${language}`] || settingsMap['welcome_email_body'] || fallbackBody;

        body = body.replace(/{{name}}/g, userName);
        body = body.replace(/{{email}}/g, userEmail);

        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #1A1A2E; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">${subject}</h2>
                </div>
                <div style="padding: 20px; white-space: pre-wrap;">
${body}
                </div>
            </div>
        `;

        return this.sendEmail(userEmail, subject, html, 'Registration');
    }
}

module.exports = new EmailService();
