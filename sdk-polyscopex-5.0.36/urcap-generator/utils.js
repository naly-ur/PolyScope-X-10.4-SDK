import fs from 'fs'

export default class Utils {

    validateURCapId(input) {
        if (fs.existsSync('../' + input)) {
            return 'URCap Contribution already exists, please select a different URCap Contribution Id.';
        }
        if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
        else return 'URCap Contribution Id may only include letters, numbers, underscores and dashes.';
    }

    validateVendorId(input) {
        if (/^([A-Za-z\-\.\_\d])+$/.test(input)) return true;
        else return 'Vendor Id may only include letters, numbers, underscores, dots and dashes.';
    }

    validateNodeName(input) {
        if (/^([A-Za-z\-\d])+$/.test(input)) return true;
        else return 'Node name may only include letters, numbers and dashes.';
    }

    toCamelcase(input) {
        if (!input) {
            return "";
        }
        return this.trim(input).charAt(0).toUpperCase()
            + input.slice(1).toLowerCase().replace(/-./g, x=>x[1].toUpperCase());
    }

    toTagName(input) {
        if (!input) {
            return "";
        }
        return this.trim(input.toLowerCase().replace(/\.|_/g, '-'));
    }

    toTitle(input) {
        if (!input) {
            return "";
        }
        return this.toTagName(input).charAt(0).toUpperCase()
            + input.slice(1).toLowerCase().replace(/-./g, x=>' '+x[1].toUpperCase());
    }

    trim(input) {
        if (!input) {
            return "";
        }
        return input.replace(/-/g, ' ').trim().replace(/\s+/g, "-");
    }

    toROS2NodeName(input) {
        if (!input) {
            return "";
        }
        return this.trim(input.toLowerCase().replace(/\.|-/g, '_'));
    }
}

