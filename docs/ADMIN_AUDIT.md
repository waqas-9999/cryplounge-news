# Admin Platform — Frontend Audit & Mapping

Deliverable for step 1 of the admin brief: audit the frontend, identify every
editable element, map each to its admin management, and decide what to remove,
keep or build.

Repository state audited: `997c256`.

---

## 1. The two blockers

Both must be cleared before an admin module can do anything real. They are
stated first because they change the build order.

### Blocker A — nothing in the admin persists

Every existing admin screen is a mock. Concretely:

| Measure | Count |
|---|---|
| Admin page components | 26 |
| Contain a `setTimeout` fake save | 12 |
| Show a "saved successfully" toast | 15 |
| Perform an actual write (`fetch`, storage, mutation) | **0** |

`GeneralSettingsPage.handleSave` is representative:

```ts
const handleSave = () => {
  setIsSaving(true);
  setTimeout(() => {
    setIsSaving(false);
    toast.success('General settings saved successfully!');
  }, 1000);
};
```

It tells the editor their work was saved. Nothing was saved. Building 18 more
modules on this pattern multiplies a lie.

There is no database, no API, and no session store. `AdminAuthService`
validates against two hardcoded credential pairs in a client bundle.

### Blocker B — the public pages do not read from the data layer

This is the deeper problem, and it is not obvious from the outside.

| Page component | Hardcoded article titles in JSX |
|---|---|
| HomePage | 26 |
| LatestPage | 13 |
| MarketsPage | 13 |
| BusinessPage | 13 |
| TechnologyPage | 13 |
| RegulationPage | 13 |
| ResearchPage | 13 |
| **Total** | **104** |

Only `ArticleDetailPage`, `FoundersPage` and `SearchPage` read from the data
layer at all. The seven section pages above render **hardcoded JSX**.

The consequence: a CMS that edits articles would write to `mockArticles`, while
the public site continues to display baked-in strings that ignore it. The
requirement "the admin must fully control the frontend" cannot be satisfied
until these pages render from data.

Those same seven files are also near-identical duplicates of each other
(~2,300 lines), so fixing this removes a large amount of duplication at the
same time.

---

## 2. Frontend surface → admin mapping

Every editable element on the public site, and what must manage it.

| Frontend surface | Data source today | Admin module | State |
|---|---|---|---|
| News article (detail) | `mockArticles` | News CMS | partial — list/create/edit UI exists, no persistence |
| News section pages | **hardcoded JSX** | News CMS | blocked by B |
| News desks (Industry…Market) | `lib/taxonomy` | Categories | missing |
| Article tags | `Article.tags` | Tags | missing |
| Article author | `Article.author` (string) | Authors | missing — no author entity exists |
| Ecosystem directory | `data/projects.ts` | Ecosystem Projects | **missing entirely** |
| Project profile fields | `types/project.ts` | Ecosystem Projects | missing |
| Project collections | `projectCollections` | Ecosystem Projects | missing |
| Research section | hardcoded JSX | Research | missing |
| Regulation section | hardcoded JSX | Regulation | missing |
| Events list | `mockEvents` | Events | missing |
| Founder stories | `mockFounders` | Founders | missing |
| Homepage section order | hardcoded JSX | Homepage Sections | missing |
| Header / footer nav | `components/Header.tsx` | Navigation | missing |
| Site name, logo, social | `config/site.ts` | Settings → Brand | missing |
| Page metadata | per-route `metadata` | SEO | partial — settings UI exists, writes nothing |
| `robots.txt` / `sitemap.xml` | **do not exist** | SEO | missing |
| RSS feed | `app/rss.xml/route.ts` | — | generated, no admin needed |
| Images | Unsplash URLs in `lib/images.ts` | Media Library | missing |
| Language selector | `Header.tsx`, decorative | Localization | missing — selector changes nothing |
| Ad slots | **do not exist** | Advertisements | missing |
| Article comments | `CommentSection` | Comments | orphaned — see §3 |

---

## 3. Existing admin modules — verdict

### Keep (map to a real frontend surface)

- Dashboard
- News: list, create, edit, categories
- Users, Roles & Permissions, Profile
- Settings: general, SEO, email, security, appearance, backup, API

### Remove (no corresponding frontend, or outside the product)

| Module | Reason |
|---|---|
| News → Sources | RSS ingestion pipeline; not in the editorial product |
| News → Auto-Fetch | same |
| News → AI Settings | same |
| AI Logs | logs an ingestion pipeline that is being removed |
| News → Comments | reader accounts were removed; comments have no author identity |
| News → Moderation Queue | moderates the comments above |
| Settings → API Integrations | configures the removed ingestion pipeline |

`CommentSection` still renders on `ArticleDetailPage` but has no backing
identity since reader auth was removed. It should be removed from the article
page along with its admin modules, or deferred to a future release with a
deliberate anonymous-comment design.

### Build (required by the brief, absent today)

Ecosystem Projects · Research · Regulation · Events · Founders · Tags ·
Authors · Homepage Sections · Media Library · Navigation · Localization ·
Advertisements · Audit Logs · Redirects · Analytics & Reports · Site Health

That is **16 new modules** against 6 kept.

---

## 4. Recommended build order

The brief's own constraint — "never keep placeholder pages", "every feature
must solve a real business problem" — means the admin cannot be built first.

1. **Rewire the section pages to render from the data layer** (clears Blocker
   B; also collapses ~2,300 duplicated lines into one configurable component).
2. **Backend: Prisma schema + Postgres + Route Handlers** for articles,
   projects, research, regulation, events, founders, categories, tags, authors,
   media, settings, users, audit log. Real staff auth with hashed passwords and
   httpOnly session cookies, replacing the hardcoded credentials.
3. **Admin CRUD** against that API — every screen then does what it claims.
4. **Analytics** last: it needs a pageview pipeline that does not exist yet.
   Until then, "most viewed" and "trending" reports have no honest source and
   should not be faked.

Steps 1 and 2 are prerequisites, not preamble. Building step 3 first produces
26 more screens that show success toasts and change nothing.
