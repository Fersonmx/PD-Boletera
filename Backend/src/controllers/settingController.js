const Setting = require('../models/Setting');

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
