import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const main = read('../index.html');
const tools = read('../open-source/index.html');
const styles = read('../open-source/style.css');
const pages = read('../.github/workflows/pages.yml');

test('landing page has both distinct projects with safe canonical outbound links', () => {
  assert.match(tools, /<title>Open-Source Developer Tools \| Caivra Tech LLC<\/title>/);
  assert.match(tools, /https:\/\/github.com\/caivra-tech\/GitHub-reminders/);
  assert.match(tools, /https:\/\/github.com\/caivra-tech\/caivra-repo-gallery/);
  assert.match(tools, /https:\/\/caivra-tech.github.io\/caivra-repo-gallery\//);
  assert.match(tools, /Published v1\.0\.1/);
  assert.match(tools, /Live web application/);
  assert.doesNotMatch(tools, /v1\.0\.1 (released|published|stable)/i);
  assert.doesNotMatch(tools, /security.certified/i);
});

test('public asset pipeline publishes landing page and gallery links to it', () => {
  assert.match(pages, /dist\/open-source/);
  assert.match(pages, /cp open-source\/index.html open-source\/style.css dist\/open-source\//);
  assert.match(main, /href="\.\/open-source\/"/);
  assert.ok(styles.length > 100);
});

test('promotional landing page has responsive and accessible basics', () => {
  assert.match(tools, /name="viewport"/);
  assert.match(tools, /class="skip" href="#tools"/);
  assert.match(tools, /<main>/);
  assert.match(styles, /@media\(max-width:760px\)/);
  assert.doesNotMatch(tools, /<script src=/);
});
