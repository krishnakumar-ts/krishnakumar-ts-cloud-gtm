# Krishna Kumar T S — portfolio

Static site: plain HTML, CSS and JavaScript, with three.js loaded from the jsDelivr CDN. No build step.

```
index.html              home: work with me (free listing audit + offers). The LinkedIn link lands here.
portfolio.html          portfolio (recruiter-facing)
work-with-me.html       redirect to index.html, so old links keep working
css/style.css           all styling
js/listing-check.js     7-dimension listing audit (runs in the browser; also loaded by tools/build-benchmark.js)
js/listing-benchmark.js percentile data, generated from the Discovery API snapshot (aggregates only)
js/enquiry.js           no-CRM brief forms: builds the email, opens it in Gmail / Outlook / mail app, or copies it
js/assistant.js         offline Q&A widget (fixed answers from site content; no AI, no network)
js/main.js              active nav link, active layer, reveals, chart, count-up
                        (the three.js scene is inline at the bottom of portfolio.html)
assets/             photo, résumé PDF, favicon, social preview image
```

## Run locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173. Double-clicking the HTML files also works (the 3D code is inline in portfolio.html).

## Deploy to GitHub Pages

Repo: https://github.com/krishnakumar-ts/krishnakumar-ts-cloud-gtm · live URL: https://krishnakumar-ts.github.io/krishnakumar-ts-cloud-gtm/

1. Push the contents of this `site/` folder to the root of that repo:

   ```bash
   git init
   git add .
   git commit -m "Launch site"
   git branch -M main
   git remote add origin https://github.com/krishnakumar-ts/krishnakumar-ts-cloud-gtm.git
   git push -u origin main
   ```

2. In the repo: Settings → Pages → Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`.
3. After a minute the site is live. Put https://krishnakumar-ts.github.io/krishnakumar-ts-cloud-gtm/ on LinkedIn.

## Updating

- The public audit is paste-only. `api/listing_lookup.py` (URL lookup via the Discovery API, run as a Lambda) is kept outside this folder for internal use and is not wired into the site.
- Counts on the pages ("1,700+", the stats, the refresh date) are filled from `js/listing-benchmark.js`, rounded down to the hundred, so they update themselves after a rebuild.
- New Discovery API snapshot: from `F:/Krishna-Portfolio`, run `node tools/build-benchmark.js <path to listings_<date>.csv>`. It rewrites `js/listing-benchmark.js`; no HTML edits needed.
- New résumé: replace `assets/Krishna-Kumar-TS-Resume.pdf` (keep the filename).
- New photo: replace `assets/krishna-720.*` and `assets/krishna-1080.*`.
- After deploying, paste the URL into https://www.linkedin.com/post-inspector/ so LinkedIn picks up the preview image.
- Booking links: interviews go to https://cal.com/krishna-kumar-cloud-gtm/interview-30min, offers go to https://cal.com/krishna-kumar-cloud-gtm/krishna-work-with-me. If you rename a cal.com event slug, find-and-replace it in both HTML files.
