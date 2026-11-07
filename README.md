# PickPath Shopping website

Official public website for **PickPath Shopping** by Sowell Solutions Studio / Sowell Solutions LLC.

## Production

- Primary domain: **https://pickpathshopping.com/**
- GitHub Pages repository: `SowellSolutionsStudio/pickpathshopping-website`, publishing from `main` / repository root.
- The root `CNAME` file binds GitHub Pages to `pickpathshopping.com`. Keep this file in all future deployments.
- The `www.pickpathshopping.com` subdomain should redirect to the primary domain once DNS is configured.
- Canonical URLs, robots.txt, and sitemap.xml point at the production domain.
- Public pages: `/`, `/privacy/`, `/terms/`, `/support/`, `/contact/`.
- Public support address: **info@pickpathshopping.com**.

### DNS provider / Cloudflare

Set `@` apex **A** records to GitHub Pages' four IPv4 addresses:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Set `www` **CNAME** to `sowellsolutionsstudio.github.io` (not the repository URL). Use **DNS only** in Cloudflare during GitHub Pages HTTPS certificate provisioning. Preserve existing **MX, SPF, DKIM and DMARC** records to avoid breaking `info@pickpathshopping.com`.

After DNS resolves correctly, confirm `pickpathshopping.com` under GitHub repository **Settings → Pages → Custom domain**, then enable **Enforce HTTPS** when the certificate is ready. Verify apex, www redirect, all public pages, assets, and launch signup end to end.

### Search indexing

The production pages are indexable. The 404 page deliberately retains `noindex`. Once HTTPS is confirmed, submit `https://pickpathshopping.com/sitemap.xml` to Google Search Console and request indexing of the homepage and important pages.

## Maintenance

Legal pages and the application's in-app legal copy must remain in sync before Google Play submission. Verify feature claims and support details before publishing. Avoid analytics, trackers, or third-party embeds without updating the privacy policy. The launch signup form posts to a Google Apps Script receiver and requires that the private signup sheet and deployed endpoint stay configured.
