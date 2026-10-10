import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
test('manifest is scoped MV3 without a separate settings page', async () => { const m=JSON.parse(await readFile(new URL('manifest.json',root),'utf8')); assert.equal(m.manifest_version,3); assert.equal('options_page' in m,false); assert.deepEqual(m.host_permissions,['https://www.glados.one/*']); assert.equal(m.permissions.includes('cookies'),false); });
test('popup contains inline schedule settings and uses no page navigation', async () => { const html=await readFile(new URL('popup.html',root),'utf8'); for(const id of ['schedule-form','mode-fixed','mode-random','fixed-time','random-start','random-end','retry-minutes']) assert.match(html,new RegExp(`id=["']${id}["']`)); const js=await readFile(new URL('popup.js',root),'utf8'); assert.match(js,/save-schedule-config/); assert.doesNotMatch(js,/openOptionsPage/); });
test('schedule helpers validate same-day range and select random time', async () => { const core=await import('../src/checkin-core.js'); assert.throws(()=>core.validateScheduleConfig({mode:'random',randomStart:'10:00',randomEnd:'09:00',retryMinutes:120}),/结束时间/); assert.equal(core.chooseDailyTime({mode:'random',randomStart:'08:00',randomEnd:'10:00'},()=>.5),'09:00'); });
