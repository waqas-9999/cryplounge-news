/**
 * Seeds the database from the existing in-repo content.
 *
 * Idempotent: every write is an upsert keyed on a natural key, so running it
 * repeatedly converges rather than duplicating.
 *
 * Run with:  npm run db:seed
 */
import { PrismaClient, CategoryKind, ContentStatus, ProjectStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { mockArticles } from '../src/data/mockArticles';
import { projects as seedProjects } from '../src/data/projects';
import { mockEvents } from '../src/data/mockEvents';
import { mockFounderStories } from '../src/data/mockFounders';
import { NEWS_CATEGORIES, PROJECT_CATEGORIES, labelForSlug } from '../src/lib/taxonomy';

const db = new PrismaClient();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedUsers() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      'SEED_ADMIN_PASSWORD is not set. Choose a strong password and pass it in the environment;\n' +
        'the seed deliberately refuses to create an account with a default credential.'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@cryplounge.com').toLowerCase();

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Site Owner', passwordHash, role: Role.SUPER_ADMIN, isActive: true },
  });

  console.log(`  user: ${user.email} (${user.role})`);
  return user;
}

async function seedCategories() {
  for (const [index, slug] of NEWS_CATEGORIES.entries()) {
    await db.category.upsert({
      where: { kind_slug: { kind: CategoryKind.NEWS, slug } },
      update: { name: labelForSlug(slug), position: index },
      create: { kind: CategoryKind.NEWS, slug, name: labelForSlug(slug), position: index },
    });
  }
  for (const [index, slug] of PROJECT_CATEGORIES.entries()) {
    await db.category.upsert({
      where: { kind_slug: { kind: CategoryKind.PROJECT, slug } },
      update: { name: labelForSlug(slug), position: index },
      create: { kind: CategoryKind.PROJECT, slug, name: labelForSlug(slug), position: index },
    });
  }
  const count = await db.category.count();
  console.log(`  categories: ${count}`);
}

async function upsertTags(names: string[]) {
  const tags = [];
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    tags.push(
      await db.tag.upsert({ where: { slug }, update: {}, create: { slug, name } })
    );
  }
  return tags;
}

async function seedArticles(createdById: string) {
  for (const article of mockArticles) {
    const slug = article.slug ?? article.id;
    const category = await db.category.findUnique({
      where: { kind_slug: { kind: CategoryKind.NEWS, slug: article.categorySlug } },
    });

    const authorSlug = slugify(article.author);
    const author = await db.author.upsert({
      where: { slug: authorSlug },
      update: {},
      create: { slug: authorSlug, name: article.author },
    });

    const tags = await upsertTags(article.tags ?? []);

    await db.article.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: article.title,
        summary: article.summary,
        content: article.content ?? article.summary,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(article.publishedAt),
        featured: article.featured ?? false,
        readMinutes: Number.parseInt(article.readTime, 10) || 3,
        categoryId: category?.id,
        authorId: author.id,
        createdById,
        tags: { connect: tags.map(t => ({ id: t.id })) },
      },
    });
  }
  console.log(`  articles: ${await db.article.count()}`);
}

async function seedProjectDirectory() {
  const statusMap: Record<string, ProjectStatus> = {
    live: ProjectStatus.LIVE,
    beta: ProjectStatus.BETA,
    testnet: ProjectStatus.TESTNET,
    deprecated: ProjectStatus.DEPRECATED,
  };

  for (const project of seedProjects) {
    const category = await db.category.findUnique({
      where: { kind_slug: { kind: CategoryKind.PROJECT, slug: project.category } },
    });
    const tags = await upsertTags(project.tags);

    await db.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: {
        slug: project.slug,
        name: project.name,
        tagline: project.tagline,
        about: project.about,
        keyFeatures: project.keyFeatures,
        categoryId: category?.id,
        blockchain: project.blockchain,
        supportedNetworks: project.supportedNetworks,
        nativeToken: project.nativeToken,
        launchYear: project.launchYear,
        status: statusMap[project.status] ?? ProjectStatus.LIVE,
        verified: project.verified,
        openSource: project.openSource,
        featured: project.featured,
        editorsPick: project.editorsPick,
        logo: project.logo,
        accent: project.accent,
        website: project.links.website,
        x: project.links.x,
        github: project.links.github,
        discord: project.links.discord,
        telegram: project.links.telegram,
        linkedin: project.links.linkedin,
        youtube: project.links.youtube,
        medium: project.links.medium,
        docs: project.links.docs,
        whitepaper: project.links.whitepaper,
        createdAt: new Date(project.addedAt),
        tags: { connect: tags.map(t => ({ id: t.id })) },
      },
    });
  }
  console.log(`  projects: ${await db.project.count()}`);
}

async function seedEvents() {
  for (const event of mockEvents) {
    await db.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: {
        slug: event.slug,
        name: event.name,
        summary: event.summary,
        content: event.content ?? event.description,
        startsAt: new Date(event.date),
        endsAt: event.endDate ? new Date(event.endDate) : null,
        mode:
          event.locationType === 'online'
            ? 'ONLINE'
            : event.locationType === 'hybrid'
              ? 'HYBRID'
              : 'OFFLINE',
        venue: event.location,
        registerUrl: event.registerLink,
        status: event.status === 'published' ? ContentStatus.PUBLISHED : ContentStatus.DRAFT,
        featured: event.featured,
        sponsors: event.sponsors ?? [],
        speakers: {
          create: (event.speakers ?? []).map(s => ({
            name: s.name,
            title: s.title,
            bio: s.bio,
            photoUrl: s.photo,
          })),
        },
      },
    });
  }
  console.log(`  events: ${await db.event.count()}`);
}

async function seedFounders() {
  for (const story of mockFounderStories) {
    await db.founder.upsert({
      where: { slug: story.slug },
      update: {},
      create: {
        slug: story.slug,
        name: story.name,
        role: story.role,
        company: story.project,
        bio: story.content,
        excerpt: story.excerpt,
        region: story.region,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(story.publishDate),
        website: story.socialLinks?.website,
        x: story.socialLinks?.twitter,
        linkedin: story.socialLinks?.linkedin,
        github: story.socialLinks?.github,
      },
    });
  }
  console.log(`  founders: ${await db.founder.count()}`);
}

async function seedHomepageSections() {
  const sections = [
    { key: 'featured', title: 'Featured' },
    { key: 'latest', title: 'Latest News' },
    { key: 'trending', title: 'Trending' },
    { key: 'editors_picks', title: "Editor's Picks" },
    { key: 'recommended', title: 'Recommended' },
    { key: 'most_read', title: 'Most Read' },
    { key: 'market_news', title: 'Market News' },
    { key: 'research_picks', title: 'Research Picks' },
    { key: 'founder_spotlight', title: 'Founder Spotlight' },
    { key: 'ecosystem_spotlight', title: 'Ecosystem Spotlight' },
    { key: 'trending_projects', title: 'Trending Projects' },
    { key: 'upcoming_events', title: 'Upcoming Events' },
    { key: 'newsletter', title: 'Newsletter Block' },
  ];

  for (const [position, section] of sections.entries()) {
    await db.homepageSection.upsert({
      where: { key: section.key },
      update: { position },
      create: { ...section, position, enabled: true },
    });
  }
  console.log(`  homepage sections: ${await db.homepageSection.count()}`);
}

async function seedLanguages() {
  await db.language.upsert({
    where: { code: 'en' },
    update: { isDefault: true },
    create: { code: 'en', name: 'English', isDefault: true, enabled: true },
  });
  console.log(`  languages: ${await db.language.count()}`);
}

async function main() {
  console.log('Seeding CrypLounge…');
  const owner = await seedUsers();
  await seedCategories();
  await seedArticles(owner.id);
  await seedProjectDirectory();
  await seedEvents();
  await seedFounders();
  await seedHomepageSections();
  await seedLanguages();
  console.log('Done.');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
