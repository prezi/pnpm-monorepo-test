module.exports = {
    hooks: {
        readPackage,
        afterAllResolved,
    },
};

function readPackage(pkg, context) {

    // Add redux as redux-thunk's peerDependencies
    addDependencies(pkg, {
        targetPackage: 'redux-thunk',
        peerDependencies: {
            redux: '^4.0.0',
        },
    });

    // react-dnd has an undeclared dependency on 'invariant',
    // because one of its dependencies `dnd-core` has it as a peer dep, it's not declared among react-dnd's deps.
    addDependencies(pkg, {
        targetPackage: 'react-dnd',
        dependencies: {
            invariant: '^2.0.0',
        },
    });

    // video.js doesn't declare a bunch of dependencies it has on packages, because all these are coming as
    //   phantom dependencies through one of it's direct deps, so for PNPM, we need to add these artifically
    addDependencies(pkg, {
        targetPackage: 'video.js',
        dependencies: {
            'url-toolkit': '^2.0.0',
            'm3u8-parser': '*',
            'mpd-parser': '*',
            'mux.js': '*',
            'aes-decrypter': '*',
        },
    });

    addDependencies(pkg, {
        targetPackage: 'create-react-class',
        peerDependencies: {
            react: '16.12.0'
        }
    });

    // pnpm fails to set up proper peerDependency links between these packages, so we have to do a real dep link
    addDependencies(pkg, {
        targetPackage: 'snapsvg-cjs',
        dependencies: {
            eve: "~0.5.1"
        }
    });

    // pnpm fails to set up proper peerDependency links between these packages, so we have to do a real dep link
    addDependencies(pkg, {
        targetPackage: 'react-redux',
        dependencies: {
            'redux': '^4.0.0'
        }
    })

    return pkg;
}

function afterAllResolved(context) {
    return context;
}

function addDependencies(pkg, {
    targetPackage,
    dependencies,
    peerDependencies,
    devDependencies,
}) {
    const [targetPackageName, targetPackageVersion] = targetPackage.split('@');

    if (pkg.name === targetPackageName) {
        if (typeof targetPackageVersion === 'undefined' || targetPackageVersion === pkg.version) {
            if (dependencies) {
                console.log(`Adding dependencies: ${targetPackage} <---+---- ${JSON.stringify(dependencies)}\n`);
                mergeOnto(pkg.dependencies, dependencies);
            }
            if (peerDependencies) {
                console.log(
                    `Adding peerDependencies: ${targetPackage} <---+---- ${JSON.stringify(peerDependencies)}\n`);
                mergeOnto(pkg.peerDependencies, peerDependencies);
            }
            if (devDependencies) {
                console.log(`Adding devDependencies: ${targetPackage} <---+---- ${JSON.stringify(devDependencies)}\n`);
                mergeOnto(pkg.devDependencies, devDependencies);
            }
        } else {
            // It's not the target version of the package, no modifications
        }

    } else {
        // It's not the target package, no modifications
    }
}

function mergeOnto(obj, extension) {
    Object.keys(extension).forEach(key => {
        obj[key] = extension[key];
    });
}
