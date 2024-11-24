const browserSync = require('browser-sync').create();

// Start BrowserSync server
browserSync.init({
	proxy: "http://localhost:3000", // Your Node.js app URL
	files: ["public/**/*.*"],      // Watch files in the 'public' directory
	port: 3000                     // BrowserSync runs on port 4000
});
