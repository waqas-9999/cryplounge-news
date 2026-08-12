import { HomeView } from '@/views';
import { getFeaturedProjects } from '@/services/projects';
import { getLatestArticles } from '@/services/news';

/**
 * Editorial content changes between builds: an article published, updated or
 * deleted in the CMS must appear on the live site without a redeploy. Without
 * this the route is rendered once at build time and served from the full route
 * cache forever, which is why removed articles kept showing.
 */
export const revalidate = 60;

/**
 * Homepage. Projects *and* articles are fetched here on the server and handed
 * to the view, so no data-layer import crosses into the client bundle and the
 * headlines are present in the initial HTML for crawlers.
 *
 * Fetched in parallel — they are independent, and running them in series would
 * add a full API round trip to TTFB.
 */
export default async function Page() {
  const [spotlightProjects, latestArticles] = await Promise.all([
    getFeaturedProjects(4),
    getLatestArticles(30),
  ]);

  return <HomeView spotlightProjects={spotlightProjects} initialArticles={latestArticles} />;
}
