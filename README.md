# Peak Barrie Services — Website

A complete redesign of the Peak Barrie Services website: landscaping and lawn
care in Simcoe County, Ontario.

Built with vanilla HTML, CSS and JavaScript — no build step, no dependencies,
no environment variables. Open `index.html` (or serve the folder statically)
and it runs.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — hero + quote form, services, why us, 3-step process, testimonials, service areas, contact |
| `services.html` | All nine services in detail |
| `gallery.html` | Completed project photography |
| `service-areas.html` | Simcoe County, Barrie, Oro-Medonte, Springwater, Innisfil, Orillia, Wasaga Beach |
| `contact.html` | Contact details, operating hours and the free-quote form |
| `privacy-policy.html` | Privacy policy |
| `terms.html` | Terms & conditions |

## Structure

```
assets/css/styles.css   design tokens, layout, components, responsive rules
assets/js/main.js       navigation, sticky header, scroll reveal, form handling
favicon.svg             brand mark favicon
robots.txt, sitemap.xml SEO
```

## Business details used

- **Phone:** (705) 413-4093
- **Email:** support@peakbarrieservices.com
- **Hours:** Monday–Saturday 9:00am–5:00pm, closed Sunday
- **Services:** Landscaping · Lawn Care · Sod Installation · Garden Maintenance ·
  Garden Design · Mulching · Land Clearing · Spring & Fall Cleanups ·
  Commercial Property Maintenance

## Forms

Every form on the site POSTs to LeadrVision:

```
https://vision.leadrai.com/api/forms/d9c8d26bb8c787ab1e4b26b4818d48a8
```

Each form includes:

- `method="POST"` with that `action`, so submission works with JavaScript disabled
- a hidden `_form` field naming the form (`Quote request` / `Contact`)
- a hidden `_page` field stamped with `window.location.href` on load and included
  in the JSON body of `fetch()` submissions
- a hidden `_gotcha` honeypot field
- human-readable `name` attributes, using exactly `name`, `email` and `phone`
  for those three fields

With JavaScript enabled the form is submitted via `fetch()` to the same URL and
the `{"ok": true}` response renders an inline confirmation. Without JavaScript
the browser posts the form and the visitor returns to the page with
`?submitted=1`, which renders the same confirmation. There are no file upload
fields, no `mailto:` actions and no third-party form services.

## Images

All photography is the business's own, reused from the previous site and served
from its existing CDN. No stock imagery is used.
