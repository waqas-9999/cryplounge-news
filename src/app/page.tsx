import { HomeView } from '@/views';
import { getFeaturedProjects } from '@/services/projects';

/**
 * Homepage. Project data is fetched here on the server and handed to the view,
 * so no data-layer import crosses into the client bundle.
 */
export default async function Page() {
  const spotlightProjects = await getFeaturedProjects(4);
  return <HomeView spotlightProjects={spotlightProjects} />;
}
