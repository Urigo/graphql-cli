const path = require('path');
const packageJsonPath = path.join(process.cwd(), './package.json');
const packageJson = require(packageJsonPath);
const badVersion = packageJson.version;
const fixedVersion = badVersion.replace('2.2.1', '4.0.0');
packageJson.version = fixedVersion;
function fixDeps(fieldName) {
    for (const dependency in packageJson[fieldName]) {
        if (packageJson[fieldName][dependency] === badVersion) {
            packageJson[fieldName][dependency] = fixedVersion;
        }
    }
}
fixDeps('dependencies');
fixDeps('devDependencies');
fixDeps('peerDependencies');
fixDeps('optionalDependencies');
const fs = require('fs');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
