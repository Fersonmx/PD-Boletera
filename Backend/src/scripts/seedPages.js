const { Page } = require('../models');
const sequelize = require('../config/db');

const pages = [
    {
        title: 'Centro de Ayuda',
        slug: 'help-center',
        content: `
<h1>Centro de Ayuda</h1>
<p>Bienvenido al soporte de WOW Ticket. Aquí encontrarás respuestas a las preguntas más frecuentes.</p>

<h2>Preguntas Frecuentes</h2>

<h3>¿Cómo compro mis boletos?</h3>
<p>Navega a la página del evento, selecciona la cantidad de boletos y la zona deseada. Procede al pago con tu tarjeta de crédito o débito.</p>

<h3>¿Puedo solicitar un reembolso?</h3>
<p>Por lo general, las ventas son finales. Solo se ofrecen reembolsos si el evento es cancelado o reprogramado, conforme a nuestros Términos de Servicio.</p>

<h3>¿Mis boletos son transferibles?</h3>
<p>Sí, puedes transferir tus boletos digitales a otra persona desde tu cuenta, siempre y cuando el evento lo permita.</p>

<h3>No recibí mi correo de confirmación</h3>
<p>Revisa tu carpeta de SPAM. Si aún no lo encuentras, contacta a soporte con tu número de orden.</p>
        `,
        isActive: true
    },
    {
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
    },
    {
        title: 'Política de Privacidad',
        slug: 'privacy-policy',
        content: `
<h1>Política de Privacidad</h1>
<p><strong>Última actualización: 10 de Febrero de 2026</strong></p>

<p>En WOW Ticket, nos tomamos muy en serio tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.</p>

<h2>1. Información que Recopilamos</h2>
<p>Podemos recopilar información personal como tu nombre, dirección de correo electrónico, número de teléfono y detalles de pago cuando realizas una compra.</p>

<h2>2. Uso de la Información</h2>
<p>Utilizamos tu información para procesar tus pedidos, enviarte tus boletos y comunicarte actualizaciones sobre los eventos.</p>

<h2>3. Protección de Datos</h2>
<p>Implementamos medidas de seguridad robustas para proteger tus datos contra el acceso no autorizado.</p>

<h2>4. Cookies</h2>
<p>Utilizamos cookies para mejorar tu experiencia de navegación en nuestro sitio web.</p>
        `,
        isActive: true,
        includeContactForm: false
    },
    {
        title: 'Términos de Servicio',
        slug: 'terms-of-service',
        content: `
<h1>Términos de Servicio</h1>
<p>Bienvenido a WOW Ticket. Al utilizar nuestra plataforma, aceptas los siguientes términos y condiciones.</p>

<h2>1. Venta de Boletos</h2>
<p>Todas las ventas son finales. No se aceptan cambios ni devoluciones, excepto en caso de cancelación del evento.</p>

<h2>2. Uso del Sitio</h2>
<p>Te comprometes a utilizar el sitio solo para fines lícitos y a no interferir con su funcionamiento.</p>

<h2>3. Propiedad Intelectual</h2>
<p>Todo el contenido de este sitio, incluyendo logotipos, textos e imágenes, es propiedad de WOW Ticket o de sus respectivos dueños.</p>

<h2>4. Limitación de Responsabilidad</h2>
<p>WOW Ticket no se hace responsable por daños indirectos o consecuentes derivados del uso de nuestros servicios.</p>
        `,
        isActive: true,
        includeContactForm: false
    }
];

const seedPages = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        await sequelize.sync({ alter: true }); // Ensure tables match models and alter if needed

        for (const page of pages) {
            const [p, created] = await Page.findOrCreate({
                where: { slug: page.slug },
                defaults: page
            });

            if (created) {
                console.log(`Created page: ${page.title}`);
            } else {
                console.log(`Updated page: ${page.title}`);
                await p.update(page);
            }
        }

        console.log('Pages seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding pages:', error);
        process.exit(1);
    }
};

seedPages();
