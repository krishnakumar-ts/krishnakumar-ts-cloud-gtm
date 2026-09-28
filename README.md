# Krishna Kumar T S — portfolio

Static site: plain HTML, CSS and JavaScript, with three.js loaded from the jsDelivr CDN. No build step.

```
index.html              redirect to portfolio.html
portfolio.html          the portfolio (recruiter-facing)
css/style.css           all styling
js/listing-benchmark.js benchmark counts for the "selected work" strip, generated from the Discovery API snapshot (aggregates only)
js/enquiry.js           "Email me" dialog: a ready draft to open in Gmail / Outlook / mail app, or copy
js/assistant.js         offline hiring guide (fixed answers; no AI, no network)
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
3. After a minute the site is live. The recruiter link is https://krishnakumar-ts.github.io/krishnakumar-ts-cloud-gtm/portfolio.html (the résumé already uses it).

## Updating

- The benchmark numbers in "selected work" ("1,700+" and the two percentages) are filled from `js/listing-benchmark.js`, so they update themselves after a rebuild.
- New Discovery API snapshot: from `F:/Krishna-Portfolio`, run `node tools/build-benchmark.js <path to listings_<date>.csv>`. It rewrites `js/listing-benchmark.js`; no HTML edits needed.
- New résumé: replace `assets/Krishna-Kumar-TS-Resume.pdf` (keep the filename).
- New photo: replace `assets/krishna-720.*` and `assets/krishna-1080.*`.
- After deploying, paste the URL into https://www.linkedin.com/post-inspector/ so LinkedIn picks up the preview image.
- Booking link: https://cal.com/krishna-kumar-cloud-gtm/interview-30min (in portfolio.html, js/enquiry.js and js/assistant.js). If you rename the cal.com event slug, find-and-replace it in those three files.
