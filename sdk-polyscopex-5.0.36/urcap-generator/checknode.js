import exec from "node:child_process";
var NODE_VERSION_MIN='12.19.0';
var NODE_VERSION_MAX='18.17.1';

console.log('Checking node version...');
var nodeVersion = exec.execSync('node -v', { encoding: 'utf-8' }).replace(/v/g, '').trim();
console.log('Node v' + nodeVersion + ' found.');

var result = compareVersionNumbers(NODE_VERSION_MIN, nodeVersion);

if (result > 0) {
	console.error('Node v' + NODE_VERSION_MIN  + ' required. Please upgrade.');
	process.exit(1);
}
result = compareVersionNumbers(NODE_VERSION_MAX, nodeVersion);
if (result < 0) {
    console.error('Node v' + NODE_VERSION_MAX  + ' accepted. Please downgrade.');
	process.exit(2);
}

function isPositiveInteger(x) {
    return /^\d+$/.test(x);
}

function compareVersionNumbers(v1, v2){
    var v1parts = (v1+'').split('.');
    var v2parts = (v2+'').split('.');

     function validateParts(parts) {
        for (var i = 0; i < parts.length; ++i) {
            if (!isPositiveInteger(parts[i])) {
                return false;
            }
        }
        return true;
    }
    if (!validateParts(v1parts) || !validateParts(v2parts)) {
        return NaN;
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        if (parseInt(v1parts[i],10) > parseInt(v2parts[i],10)) {
            return 1;
        }
        return -1;
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}