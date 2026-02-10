const { OrderTicket, Ticket, Event, Venue } = require('../models');
const jwt = require('jsonwebtoken');
// const { PKPass } = require('passkit-generator'); // Uncomment if using real certs
// For now we will return a mock file or error for Apple, and a link for Google.

exports.getAppleWalletPass = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await OrderTicket.findByPk(ticketId, {
            include: [
                {
                    model: Ticket,
                    include: [{ model: Event, include: [Venue] }]
                }
            ]
        });

        if (!ticket) return res.status(404).send('Ticket not found');
        const event = ticket.Ticket.Event;

        if (event.isDynamicQr) {
            return res.status(400).send('Dynamic tickets cannot be added to standard wallets.');
        }

        // --- MOCK PKPASS GENERATION ---
        // Without certificates (p12, wwdr), we cannot generate a valid signed .pkpass that iOS accepts.
        // However, we can simulate the download for the user to verify the flow.

        // In a real implementation:
        // const pass = new PKPass({}, { ...certs... }, { ...passData... });
        // pass.pipe(res);

        // For MVP/Demo without certs:
        res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${ticket.uniqueCode}.pkpass`);
        res.send('MOCK_PKPASS_BINARY_DATA_GOES_HERE');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getGoogleWalletLink = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await OrderTicket.findByPk(ticketId, {
            include: [
                {
                    model: Ticket,
                    include: [{ model: Event, include: [Venue] }]
                }
            ]
        });

        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        const event = ticket.Ticket.Event;

        if (event.isDynamicQr) {
            return res.status(400).json({ message: 'Dynamic tickets cannot be added to standard wallets.' });
        }

        // --- GOOGLE WALLET JWT ---
        // Needs ISSUER_ID and Private Key from Google Service Account.
        // We will construct a link that WOULD work if we had valid credentials.

        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || 'example_issuer_id';
        const classId = `${issuerId}.${event.id}`;
        const objectId = `${issuerId}.${ticket.uniqueCode}`;

        // Simplified payload structure
        const payload = {
            iss: 'example@service-account.com',
            aud: 'google',
            typ: 'savetowallet',
            iat: Math.floor(Date.now() / 1000),
            origins: [],
            payload: {
                eventTicketObjects: [{
                    id: objectId,
                    classId: classId,
                    state: 'ACTIVE',
                    barcode: {
                        type: 'QR_CODE',
                        value: ticket.uniqueCode
                    },
                    heroImage: {
                        sourceUri: { uri: event.imageUrl || 'https://example.com/default.jpg' }
                    }
                }]
            }
        };

        // Sign with whatever secret we have for MVP demo (real Google Wallet needs RS256 with service account key)
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
        const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

        res.json({ url: saveUrl });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
