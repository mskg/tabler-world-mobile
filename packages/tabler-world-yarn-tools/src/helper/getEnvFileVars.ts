// borrowed from https://raw.githubusercontent.com/toddbluhm/env-cmd

import * as fs from 'fs';

/**
 * Gets the environment vars from an env file
 */
export function getEnvFileVars(envFilePath: string): { [key: string]: any } {
    if (!fs.existsSync(envFilePath)) {
        throw new Error(`Invalid env file path (${envFilePath}).`);
    }

    const file = fs.readFileSync(envFilePath, { encoding: 'utf8' });
    return parseEnvString(file); 1
}

/**
 * Parse out all env vars from a given env file string and return an object
 */
function parseEnvString(envFileString: string): { [key: string]: string } {
    let result = stripComments(envFileString.toString());
    result = stripEmptyLines(result);

    return parseEnvVars(result);
}

/**
 * Parse out all env vars from an env file string
 */
function parseEnvVars(envString: string): { [key: string]: string } {
    const envParseRegex = /^((.+?)[=](.*))$/gim;
    const matches: { [key: string]: string } = {};
    let match;

    while ((match = envParseRegex.exec(envString)) !== null) {
        // Note: match[1] is the full env=var line
        const key = match[2].trim();
        const value = match[3].trim();

        // remove any surrounding quotes
        matches[key] = value
            .replace(/(^['"]|['"]$)/g, '')
            .replace(/\\n/g, '\n');
    }

    return matches;
}

/**
 * Strips out comments from env file string
 */
function stripComments(envString: string): string {
    const commentsRegex = /(^#.*$)/gim;
    let match = commentsRegex.exec(envString);
    let newString = envString;

    while (match != null) {
        newString = newString.replace(match[1], '');
        match = commentsRegex.exec(envString);
    }

    return newString;
}

function stripEmptyLines(envString: string): string {
    const emptyLinesRegex = /(^\n)/gim;
    return envString.replace(emptyLinesRegex, '');
}