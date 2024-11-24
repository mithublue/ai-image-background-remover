const express = require('express');
const fileUpload = require('express-fileupload');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(fileUpload()); // Handle file uploads

// Route to serve the index.html
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle background removal
app.post('/remove-background', (req, res) => {
	if (!req.files || !req.files.image) {
		return res.status(400).send('No image file was uploaded.');
	}

	const inputImage = req.files.image;
	const inputPath = path.join(__dirname, 'public', 'uploads', inputImage.name);
	const outputPath = path.join(__dirname, 'public', 'output', `${inputImage.name}-${Date.now()}.png`);

	// Save the uploaded file
	inputImage.mv(inputPath, (err) => {
		if (err) {
			console.error(err);
			return res.status(500).send('Failed to save the uploaded file.');
		}

		// Run the Python script
		const python = spawn('python', ['remove_bg.py', inputPath, outputPath]);

		python.stdout.on('data', (data) => {
			console.log(`Python Output: ${data}`);
		});

		python.stderr.on('data', (data) => {
			console.error(`Python Error: ${data}`);
		});

		python.on('close', (code) => {
			fs.unlinkSync(inputPath); // Delete the uploaded file after processing

			if (code === 0) {
				// Send the processed image back to the client
				res.sendFile(outputPath);
			} else {
				res.status(500).send('Failed to process the image.');
			}
		});
	});
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
