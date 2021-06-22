// borrowed from https://raw.githubusercontent.com/toddbluhm/env-cmd

import { ChildProcess } from 'child_process'; // eslint-disable-line

const SIGNALS_TO_HANDLE: NodeJS.Signals[] = [
    'SIGINT', 'SIGTERM', 'SIGHUP',
];

export class TermSignals {
    public exitCalled = false;
    private readonly terminateSpawnedProcessFuncHandlers: { [key: string]: any } = {};

    public handleTermSignals(proc: ChildProcess): void {
        // Terminate child process if parent process receives termination events
        SIGNALS_TO_HANDLE.forEach((signal): void => {
            this.terminateSpawnedProcessFuncHandlers[signal] =
                (s: any, code: any): void => {
                    this.removeProcessListeners();
                    if (!this.exitCalled) {
                        this.exitCalled = true;
                        proc.kill(s);
                        this.terminateProcess(code, s);
                    }
                };

            process.once(signal, this.terminateSpawnedProcessFuncHandlers[signal]);
        });
        process.once('exit', this.terminateSpawnedProcessFuncHandlers.SIGTERM);

        // Terminate parent process if child process receives termination events
        proc.on('exit', (code: number | undefined, signal: string | null): void => {
            this.removeProcessListeners();
            const convertedSignal = signal != null ? signal : undefined;

            if (!this.exitCalled) {
                this.exitCalled = true;
                this.terminateProcess(code, convertedSignal);
            }
        });
    }

    /**
     * Enables catching of unhandled exceptions
     */
    public handleUncaughtExceptions(): void {
        process.on('uncaughtException', (e): void => this.uncaughtExceptionHandler(e));
    }

    /**
     * Terminate parent process helper
     */
    public terminateProcess(code?: number, signal?: string): void | true {
        if (signal !== undefined) {
            return process.kill(process.pid, signal);
        }
        if (code !== undefined) {
            return process.exit(code);
        }
        throw new Error('Unable to terminate parent process successfully');
    }

    /**
     * Exit event listener clean up helper
     */
    public removeProcessListeners(): void {
        SIGNALS_TO_HANDLE.forEach((signal): void => {
            process.removeListener(signal, this.terminateSpawnedProcessFuncHandlers[signal]);
        });
        process.removeListener('exit', this.terminateSpawnedProcessFuncHandlers.SIGTERM);
    }

    /**
     * General exception handler
     */
    public uncaughtExceptionHandler(e: Error): void {
        console.error(e.message);
        process.exit(1);
    }
}
