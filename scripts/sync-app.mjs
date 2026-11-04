// Copies skills/ into the SnapWidget app, which serves them at /.well-known/agent-skills/ from
// resources/agent-skills/. Run after each skill change: npm run sync-app -- <app folder>
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const app = process.argv[2];
if (!app || !existsSync(join(app, 'artisan'))) {
  throw new Error('Give the folder of the SnapWidget app: npm run sync-app -- <app folder>');
}
const source = new URL('../skills/', import.meta.url).pathname;
const target = resolve(app, 'resources/agent-skills');
for (const skill of readdirSync(source)) {
  // Delete first, so a file that left the skill also leaves the app.
  rmSync(join(target, skill), { recursive: true, force: true });
  cpSync(join(source, skill), join(target, skill), { recursive: true });
  console.log(`${skill} -> ${join(target, skill)}`);
}
