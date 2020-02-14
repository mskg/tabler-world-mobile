export function verifyMaintenance() {
    if (process.env.maintenance === 'true') {
        throw new Error(process.env.maintenance_text || '"We\'re sorry, TABLER.APP is currently down for maintenance."');
    }
}
