import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const build = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'src/server/tsconfig.json'], {
  stdio: 'inherit', windowsHide: true,
});
if (build.status !== 0) process.exit(build.status ?? 1);

// Keep the backend in its normal Node runtime; tsx only watches/restarts this launcher.
const server = spawn(process.execPath, ['dist/server/server/server.js'], { stdio: 'inherit', windowsHide: true });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => server.kill(signal));
server.on('error', error => { console.error(error); process.exitCode = 1; });
server.on('exit', code => { process.exitCode = code ?? 0; });
