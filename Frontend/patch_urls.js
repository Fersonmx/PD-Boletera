const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src/app', function(filePath) {
    if (filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Pattern for getImageUrl function
        const oldPattern = /getImageUrl\s*\(\s*path\s*:\s*string\s*\)\s*:\s*string\s*\{\s*if\s*\(!path\)\s*return\s*'';\s*if\s*\(path\.startsWith\('http'\)\)\s*return\s*path;\s*const\s*baseUrl\s*=\s*environment\.apiUrl\.replace\('\/api',\s*''\);\s*const\s*normalizedPath\s*=\s*path\.startsWith\('\/'\)\s*\?\s*path\s*:\s*`\/\$\{path\}`;\s*return\s*`\$\{baseUrl\}\$\{normalizedPath\}`;\s*\}/g;
        
        const newPattern = `getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Auto-fix old database paths to ensure Nginx proxies them to Node
    if (path.startsWith('/uploads')) {
        path = '/api' + path;
    }
    
    const baseUrl = environment.apiUrl.replace('/api', '');
    const normalizedPath = path.startsWith('/') ? path : \`/\${path}\`;
    return \`\${baseUrl}\${normalizedPath}\`;
  }`;

        if (content.match(oldPattern)) {
            content = content.replace(oldPattern, newPattern);
            modified = true;
        }

        // Also fix where upload component writes layout.imageUrl directly
        if (content.includes("layout.imageUrl = baseUrl + res.filePath;")) {
            // we don't need to change this if res.filePath is already from the controller 
            // but let's make sure it doesn't double append. The controller now sends /api/uploads/
            // baseUrl is http://domain. If we use baseUrl + /api/uploads, it works perfectly.
        }

        // Fix profile.component assigning image url
        // `user.profilePicture = baseUrl + res.filePath;`
        // Same logic, works perfectly.

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Patched: ' + filePath);
        }
    }
});
