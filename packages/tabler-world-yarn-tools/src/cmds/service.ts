import spwan from 'cross-spawn';
import { createEnv } from '../helper/createEnv';
import { TermSignals } from '../helper/TermSignals';

// tslint:disable-next-line: export-name
export default () => {
    const finalEnv = createEnv();

    // "deploy": "env-cmd --no-override ../../config/.env cross-env-shell \"serverless deploy --force --verbose\"",
    // "package": "env-cmd --no-override ../../config/.env cross-env-shell \"serverless package --force --verbose\"",
    // "remove": "env-cmd --no-override ../../config/.env cross-env-shell \"serverless remove --verbose\"",
    // "dev": "env-cmd --no-override ../../config/.env cross-env-shell \"source ../../config/.env.local && serverless offline start --port 3002 --verbose --noTimeout --noAuth\"",

    const [, , cmd, ...userArgs] = process.argv;

    if (cmd == null) {
        console.log('<deploy> [...args]');
        console.log('<package> [...args]');
        console.log('<remove> [...args]');
        console.log('');
        console.log('<dev> [...args]');

        process.exit(-1);
    }

    let baseArgs: string[] = [];
    switch (cmd.toLowerCase()) {
    case 'deploy':
        baseArgs = ['deploy', '--force', '--verbose'];
        break;

    case 'package':
        baseArgs = ['package', '--force', '--verbose'];
        break;

    case 'remove':
        baseArgs = ['remove', '--verbose'];
        break;

    case 'dev':
        baseArgs = ['offline', 'start', '--verbose', '--noTimeout', '--noAuth'];
        break;

    default:
        console.error('Invalid cmd', cmd);
        process.exit(-1);
        break;
    }

    // console.debug("running", cmd, args);

    const proc = spwan('serverless', [...baseArgs, ...(userArgs || [])], {
        stdio: 'inherit',
        //    shell: options.useShell,
        env: finalEnv,
    });

    // Handle any termination signals for parent and child proceses
    const signals = new TermSignals();
    signals.handleUncaughtExceptions();
    signals.handleTermSignals(proc);
};
