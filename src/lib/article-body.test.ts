import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderSummaryHtml } from './article-body';

/*
 * The public renderer for the linked standfirst. Run with `npm run test:unit`.
 * The backend sanitizes on save; these pin the second pass on render.
 */

test('keeps a source link and an internal link, with safe rel on the external one', () => {
  const html = renderSummaryHtml(
    'The <a href="https://www.sec.gov/rules/final" target="_blank" rel="nofollow noopener">SEC rule</a> follows ' +
      '<a href="https://cryplounge.com/news/regulation/earlier">earlier coverage</a>.'
  );
  assert.match(html, /<a href="https:\/\/www\.sec\.gov\/rules\/final" target="_blank" rel="nofollow noopener noreferrer">SEC rule<\/a>/);
  assert.match(html, /<a href="https:\/\/cryplounge\.com\/news\/regulation\/earlier">earlier coverage<\/a>/);
});

test('keeps site-relative links', () => {
  assert.match(renderSummaryHtml('See <a href="/news/markets/story">this</a>.'), /href="\/news\/markets\/story"/);
});

test('removes scripts, handlers, styles, images and unsafe schemes but keeps the words', () => {
  const html = renderSummaryHtml(
    '<script>alert(1)</script>A <a href="javascript:alert(1)" onclick="x()">bad</a> ' +
      '<a href="data:text/html,x">data</a> <a href="http://insecure.example/x">http</a> ' +
      '<a href="https://ok.example/x" style="color:red" onmouseover="y()">ok</a> <img src="x" onerror="z()">end.'
  );
  assert.doesNotMatch(html, /script|javascript:|data:|http:\/\/|onclick|onmouseover|onerror|style=|<img/i);
  assert.match(html, /<a href="https:\/\/ok\.example\/x">ok<\/a>/);
  assert.match(html, /bad/);
  assert.match(html, /end\./);
});

test('unwraps block tags and keeps text', () => {
  assert.equal(renderSummaryHtml('<h2>Heading</h2><div>text</div>'), 'Headingtext');
});

test('plain text without links renders as plain text', () => {
  assert.equal(renderSummaryHtml('Just words.'), 'Just words.');
});
