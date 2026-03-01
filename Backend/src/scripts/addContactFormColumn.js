const sequelize = require('../config/db');

const addContactFormColumn = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const [results, metadata] = await sequelize.query("SHOW COLUMNS FROM `Pages` LIKE 'includeContactForm'");

        if (results.length === 0) {
            console.log('Column includeContactForm does not exist. Adding it...');
            await sequelize.query("ALTER TABLE `Pages` ADD COLUMN `includeContactForm` TINYINT(1) DEFAULT 0;");
            console.log('Column added successfully.');
        } else {
            console.log('Column includeContactForm already exists.');
        }

        // Now run the seed logic for the contact page specifically
        const { Page } = require('../models');
        const contactPage = await Page.findOne({ where: { slug: 'contact-us' } });
        if (contactPage) {
            console.log('Updating contact-us page to include contact form...');
            await contactPage.update({ includeContactForm: true });
        } else {
            console.log('Contact-us page not found, creating it...');
            await Page.create({
                title: 'Contáctanos',
                slug: 'contact-us',
                content: `
<h1>Contáctanos</h1>
<p>Estamos aquí para ayudarte. Si tienes problemas con tu compra o necesitas asistencia técnica, utiliza los siguientes medios.</p>

<ul>
    <li><strong>Email:</strong> soporte@wowticket.com</li>
    <li><strong>Teléfono:</strong> +52 (55) 1234 5678</li>
    <li><strong>Horario:</strong> Lunes a Viernes de 9:00 AM a 6:00 PM</li>
</ul>

<h2>Oficinas Corporativas</h2>
<p>Av. Reforma 222, Piso 10<br>
Ciudad de México, CDMX, 06600</p>
                `,
                isActive: true,
                includeContactForm: true
            });
        }

        console.log('Migration complete.');
        process.exit(0);

    } catch (error) {
        console.error('Error during manual migration:', error);
        process.exit(1);
    }
};

addContactFormColumn();
