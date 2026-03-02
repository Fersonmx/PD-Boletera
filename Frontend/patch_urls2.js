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
        
        // Let's manually replace the start of the function
        const matchStr = "const baseUrl = environment.apiUrl.replace('/api', '');";
        if (content.includes(matchStr)) {
            // Check if it already has our fix
            if (!content.includes("if (path.startsWith('/uploads'))")) {
                let fixStr = `if (path.startsWith('/uploads')) {\n      path = '/api' + path;\n    }\n    const baseUrl = environment.apiUrl.replace('/api', '');`;
                content = content.replace(matchStr, fixStr);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Fixed ' + filePath);
            }
        }
    }
});
