exports.uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the path relative to the server (e.g., /uploads/filename.jpg)
        // Assuming the app serves 'uploads' folder statically under '/uploads' route
        const filePath = `/uploads/${req.file.filename}`;

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
