exports.uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the path relative to the server (e.g., /api/uploads/filename.jpg)
        // By using /api/uploads, Nginx will automatically reverse proxy it to the Node backend instead of handing it to the Angular index.html fallback
        const filePath = `/api/uploads/${req.file.filename}`;

        res.status(200).json({
            message: 'File uploaded successfully',
            filePath: filePath,
            fileName: req.file.filename
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during file upload' });
    }
};
