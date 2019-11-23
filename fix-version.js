const path = require('path');
const packageJsonPath = path.join(__dirname, './package.json');
const packageJson = require(packageJsonPath);
packageJson.version = packageJson.version.replace('2.2.1', '4.0.0');
const fs = require('fs');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
