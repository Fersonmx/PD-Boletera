require('dotenv').config({ path: __dirname + '/../../.env' });
const { Page } = require('../models');

async function createMissingEnglishPages() {
    try {
        const pagesToCreate = [
            {
                slug: 'help-center',
                title: 'Help Center',
                content: '<h1>Help Center</h1><p>Find answers to frequently asked questions here.</p>'
            },
            {
                slug: 'privacy-policy',
                title: 'Privacy Policy',
                content: '<h1>Privacy Policy</h1><p>Your privacy is important to us. Read our policy.</p>'
            },
            {
                slug: 'terms-of-service',
                title: 'Terms of Service',
                content: '<h1>Terms of Service</h1><p>Please read our terms and conditions carefully.</p>'
            }
        ];

        for (const p of pagesToCreate) {
            const existing = await Page.findOne({ where: { slug: p.slug, language: 'en' } });
            if (existing) {
                console.log(`English page for ${p.slug} already exists.`);
                continue;
            }

            // Get Spanish config to copy settings
            const esPage = await Page.findOne({ where: { slug: p.slug, language: 'es' } });

            await Page.create({
                slug: p.slug,
                title: p.title,
                content: p.content,
                language: 'en',
                isActive: true,
                includeContactForm: esPage ? esPage.includeContactForm : false,
                formConfig: esPage ? esPage.formConfig : [],
                notifyEmail: esPage ? esPage.notifyEmail : null
            });
            console.log(`Created English page for ${p.slug}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createMissingEnglishPages();
