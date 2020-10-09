#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const packageNameMap = {};
const packagePathMap = {};

main();

async function main() {
    const packageNames = fs.readdirSync('./packages-old');

    for(var i = 0; i < packageNames.length; i++) {
        const packageName = packageNames[i];
        const pathToPackage = path.resolve('.', 'packages-old', packageName);
        const pathToPackageJson = path.join(pathToPackage, 'package.json');
        const packageJson = require(pathToPackageJson);
        const newPackageName = 'package_' + (i+1);

        packageNameMap[packageJson.name] = newPackageName;
        packagePathMap['link:../' + packageName] = '../' + newPackageName;
    }

    console.log({packagePathMap, packageNameMap});
    
    for(var i = 0; i < packageNames.length; i++) {
        const packageName = packageNames[i];
        const pathToPackage = path.resolve('.', 'packages-old', packageName);
        const pathToPackageJson = path.join(pathToPackage, 'package.json');
        const packageJson = require(pathToPackageJson);
        
        const newPackageName = 'package_' + (i+1);
        const newPackageJson = vetPackageJson(packageJson, newPackageName);
        const newPathToPackage = path.resolve('.', 'packages', newPackageName);
        const newPathToPackageJson = path.join(newPathToPackage, 'package.json');
        fs.mkdirSync(newPathToPackage);

        fs.writeFileSync(newPathToPackageJson, JSON.stringify(newPackageJson, null, 2));

        console.log(packageJson.name + " done.");
    }
}

function vetPackageJson(packageJson, packageName) {
    const replaceDeps = dependencies => Object.keys(dependencies || {}).map(depName => {
        const depVersion = dependencies[depName];
        if (packageNameMap[depName]) {
            const o = { [packageNameMap[depName]]: packagePathMap[depVersion] };
            console.log({packageName,depName, o});
            return o;
        } else {
            return { [depName]: depVersion }
        }
    }).reduce((accum, nextObj) => ({...accum, ...nextObj}), {});

    return {
        name: packageName,
        version: packageJson.version,
        dependencies: replaceDeps(packageJson.dependencies),
        devDependencies: replaceDeps(packageJson.devDependencies),
        peerDependencies: packageJson.peerDependencies,
        scripts: {
            postinstall: packageJson.scripts.postinstall
        }
    }
}