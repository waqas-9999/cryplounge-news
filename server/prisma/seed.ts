/**
 * Seeds the database from the existing in-repo content.
 *
 * Idempotent: every write is an upsert keyed on a natural key, so running it
 * repeatedly converges rather than duplicating.
 *
 * Run with:  npm run db:seed
 */
import { PrismaClient, CategoryKind, ContentStatus, ProjectStatus, Role } from '@prisma/client';
import * as argon2 from 'argon2';

import { mockArticles } from '../../src/data/mockArticles';
import { projects as seedProjects } from '../../src/data/projects';
import { mockEvents } from '../../src/data/mockEvents';
import { mockFounderStories } from '../../src/data/mockFounders';
import { NEWS_CATEGORIES, PROJECT_CATEGORIES, labelForSlug } from '../../src/lib/taxonomy';
import { PERMISSIONS, ROLES } from './permissions';

const db = new PrismaClient();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Permissions and role grants.
 *
 * Runs before users, because a user references a role by key. Re-running
 * resets each role to its declared grants, which is what makes the seed a
 * reliable way to recover from a mis-edited permission set.
 */
async function seedPermissions() {
  for (const permission of PERMISSIONS) {
    await db.permission.upsert({
      where: { key: permission.key },
      update: { module: permission.module, description: permission.description },
      create: permission,
    });
  }

  for (const role of ROLES) {
    const record = await db.roleDefinition.upsert({
      where: { key: role.key },
      update: { name: role.name, description: role.description, isSystem: role.isSystem },
      create: {
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      },
    });

    const keys =
      role.permissions === '*' ? PERMISSIONS.map(p => p.key) : role.permissions;

    const permissions = await db.permission.findMany({ where: { key: { in: keys } } });

    await db.rolePermission.deleteMany({ where: { roleId: record.id } });
    await db.rolePermission.createMany({
      data: permissions.map(permission => ({
        roleId: record.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  console.log(`  permissions: ${await db.permission.count()}, roles: ${await db.roleDefinition.count()}`);
}

async function seedUsers() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      'SEED_ADMIN_PASSWORD is not set. Choose a strong password and pass it in the environment;\n' +
        'the seed deliberately refuses to create an account with a default credential.'
    );
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
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

/**
 * Project collections shown on the Ecosystem homepage. Additive and
 * non-destructive: it only upserts rows into the ProjectCollection table and
 * never touches existing Project records.
 */
async function seedProjectCollections() {
  const collections = [
    {
      slug: 'ethereum-scaling',
      title: 'Ethereum Scaling',
      description: 'The rollups and proving systems carrying Ethereum activity off mainnet.',
      projectSlugs: ['arbitrum', 'base', 'starknet', 'immutable'],
    },
    {
      slug: 'defi-blue-chips',
      title: 'DeFi Blue Chips',
      description: 'Long-running protocols that most of on-chain finance is built on top of.',
      projectSlugs: ['uniswap', 'aave', 'lido', 'usdc'],
    },
    {
      slug: 'developer-stack',
      title: 'The Developer Stack',
      description: 'What teams actually reach for when building and shipping on-chain.',
      projectSlugs: ['foundry', 'the-graph', 'ipfs', 'chainlink'],
    },
    {
      slug: 'beyond-finance',
      title: 'Beyond Finance',
      description: 'Identity, social, physical infrastructure and AI — crypto outside trading.',
      projectSlugs: ['ens', 'farcaster', 'helium', 'bittensor'],
    },
  ];

  for (const [position, collection] of collections.entries()) {
    await db.projectCollection.upsert({
      where: { slug: collection.slug },
      update: {
        title: collection.title,
        description: collection.description,
        projectSlugs: collection.projectSlugs,
        position,
        active: true,
      },
      create: {
        slug: collection.slug,
        title: collection.title,
        description: collection.description,
        projectSlugs: collection.projectSlugs,
        position,
        active: true,
      },
    });
  }
  console.log(`  project collections: ${await db.projectCollection.count()}`);
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

/**
 * Legal/policy pages, migrated from the formerly-hardcoded frontend
 * components so an admin can edit them without a deploy going forward.
 */
async function seedLegalPages(ownerId: string) {
  const pages: { slug: string; title: string; seoDescription: string; content: string }[] = [
    {
      slug: 'terms',
      title: 'Terms of Service',
      seoDescription: "Read CrypLounge's Terms of Service. Learn about user responsibilities, content guidelines, and platform usage terms.",
      content: `
        <h2>1. Agreement to Terms</h2>
        <p>By accessing or using CrypLounge ("the Platform"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Platform.</p>
        <p><strong>Important:</strong> These terms constitute a legally binding agreement between you and CrypLounge.</p>
        <h2>2. Use of Platform</h2>
        <h3>2.1 Permitted Use</h3>
        <p>You may use the Platform to:</p>
        <ul>
          <li>Read and access news articles and educational content</li>
          <li>View market data and cryptocurrency information</li>
          <li>Create an account and manage your profile</li>
          <li>Submit content subject to our editorial review</li>
          <li>Participate in community discussions</li>
        </ul>
        <h3>2.2 Prohibited Use</h3>
        <p>You agree NOT to:</p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Submit false, misleading, or defamatory content</li>
          <li>Attempt to hack, disrupt, or damage the Platform</li>
          <li>Use automated systems to scrape or harvest data</li>
          <li>Impersonate other users or entities</li>
          <li>Share your account credentials with others</li>
        </ul>
        <h2>3. User Accounts</h2>
        <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for any activities or actions under your account.</p>
        <p>We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, false, or violates these Terms of Service.</p>
        <h2>4. Content</h2>
        <h3>4.1 Our Content</h3>
        <p>All content published on CrypLounge, including but not limited to text, graphics, logos, images, and software, is the property of CrypLounge or its content suppliers and is protected by copyright laws.</p>
        <h3>4.2 User-Generated Content</h3>
        <p>By submitting content to CrypLounge, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and publish your content. You retain ownership of your content but give us permission to use it on our Platform.</p>
        <h3>4.3 Content Standards</h3>
        <p>All user-generated content must be accurate, respectful, and comply with applicable laws. We reserve the right to remove any content that violates these standards.</p>
        <h2>5. Disclaimer</h2>
        <p><strong>NOT FINANCIAL ADVICE:</strong> The information provided on CrypLounge is for informational and educational purposes only. Nothing on this Platform constitutes financial, investment, legal, or tax advice.</p>
        <p>Cryptocurrency investments are highly volatile and risky. You should conduct your own research and consult with qualified professionals before making any investment decisions.</p>
        <p>CrypLounge and its contributors are not responsible for any losses or damages resulting from your use of information on this Platform.</p>
        <h2>6. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, CrypLounge shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.</p>
        <h2>7. Changes to Terms</h2>
        <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by updating the page. Your continued use of the Platform after any changes constitutes acceptance of the new Terms.</p>
        <h2>8. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with international laws, without regard to its conflict of law provisions.</p>
        <h2>9. Contact Us</h2>
        <p>If you have any questions about these Terms of Service, please contact us at <a href="mailto:cryploungeofficial@gmail.com">cryploungeofficial@gmail.com</a>.</p>
      `,
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      seoDescription: 'Learn how CrypLounge collects, uses, and protects your personal information. Read our comprehensive privacy policy and data protection practices.',
      content: `
        <h2>Your Privacy Matters</h2>
        <p>At CrypLounge, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.</p>
        <h2>1. Information We Collect</h2>
        <h3>1.1 Information You Provide</h3>
        <ul>
          <li>Name and email address</li>
          <li>Username and password</li>
          <li>Profile information (optional)</li>
          <li>Content you submit (articles, comments, submissions)</li>
          <li>Communication preferences</li>
        </ul>
        <h3>1.2 Automatically Collected Information</h3>
        <ul>
          <li>Device information (browser type, operating system)</li>
          <li>IP address and location data</li>
          <li>Pages viewed and links clicked</li>
          <li>Time and date of visits</li>
          <li>Referring website addresses</li>
        </ul>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li><strong>Service Delivery:</strong> To provide and maintain our Platform</li>
          <li><strong>Personalization:</strong> To customize content and recommendations</li>
          <li><strong>Communication:</strong> To send newsletters, updates, and notifications</li>
          <li><strong>Analytics:</strong> To understand how users interact with our Platform</li>
          <li><strong>Security:</strong> To detect and prevent fraud and abuse</li>
          <li><strong>Improvement:</strong> To enhance and optimize our services</li>
        </ul>
        <h2>3. Cookies and Tracking</h2>
        <p>We use cookies and similar tracking technologies to enhance your experience. Cookies help us remember your preferences, keep you signed in, analyze site traffic, and serve relevant advertisements.</p>
        <p>You can control cookies through your browser settings. Note that disabling cookies may limit some functionality of the Platform.</p>
        <h3>3.1 Third-Party Advertising</h3>
        <p>We use third-party advertising companies, including Google, to serve ads when you visit the Platform. These companies may use cookies and similar technologies to serve ads based on your prior visits to this and other websites.</p>
        <p>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our Platform and other sites on the internet. Google uses the DoubleClick cookie for this purpose.</p>
        <p>You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>. You can also opt out of third-party vendors' use of cookies for personalised advertising at <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">aboutads.info</a> or <a href="https://www.youronlinechoices.com/" rel="noopener noreferrer" target="_blank">youronlinechoices.com</a>.</p>
        <p>If you are located in the European Economic Area, the United Kingdom or Switzerland, we ask for your consent before any advertising or analytics cookies are set, and you can change or withdraw that consent at any time through the consent settings on this site.</p>
        <h2>4. Information Sharing</h2>
        <p>We do not sell your personal information. We may share your information only with service providers, for legal compliance, in connection with business transfers, or with your consent.</p>
        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures, including encryption in transit and at rest, regular security audits, restricted access, and secure password hashing.</p>
        <p><strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
        <h2>6. Your Rights</h2>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update or correct inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
          <li><strong>Portability:</strong> Request your data in a portable format</li>
          <li><strong>Object:</strong> Object to processing of your data for certain purposes</li>
        </ul>
        <h2>7. Data Retention</h2>
        <p>We retain your personal information for as long as necessary to provide our services. When you delete your account, we will delete or anonymize your personal information within 30 days, except where required to retain it for legal or regulatory purposes.</p>
        <h2>8. Children's Privacy</h2>
        <p>CrypLounge is not intended for users under the age of 18. We do not knowingly collect personal information from children.</p>
        <h2>9. International Data Transfers</h2>
        <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information.</p>
        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We encourage you to review this policy periodically.</p>
        <h2>11. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:cryploungeofficial@gmail.com">cryploungeofficial@gmail.com</a>.</p>
      `,
    },
    {
      slug: 'editorial-policy',
      title: 'Editorial Policy',
      seoDescription: "How CrypLounge sources, verifies, and publishes cryptocurrency and blockchain news.",
      content: `
        <h2>Our Mission</h2>
        <p>CrypLounge is committed to delivering accurate, timely, and unbiased cryptocurrency and blockchain news to our readers. Our editorial policy ensures that all content meets the highest standards of journalism while serving the crypto community's need for reliable information.</p>
        <h2>Editorial Independence</h2>
        <p>Our editorial team operates independently from our business and advertising departments. No advertiser, sponsor, or external party influences our editorial decisions, story selection, or content presentation.</p>
        <h2>Accuracy and Verification</h2>
        <ul>
          <li>All facts are verified through multiple credible sources before publication</li>
          <li>We cite sources and provide links to original documents when possible</li>
          <li>Financial data and statistics are cross-referenced with reliable industry sources</li>
          <li>Technical claims are reviewed by subject matter experts</li>
        </ul>
        <h2>Conflicts of Interest</h2>
        <p>We maintain strict policies regarding conflicts of interest:</p>
        <ul>
          <li>Writers must disclose any financial holdings in cryptocurrencies or projects they cover</li>
          <li>Staff members are prohibited from trading based on non-public information</li>
          <li>Sponsored content is clearly labeled and separated from editorial content</li>
        </ul>
        <h2>Editorial Standards</h2>
        <ul>
          <li>Clear distinction between news reporting, analysis, and opinion</li>
          <li>Balanced coverage that presents multiple perspectives</li>
          <li>Respectful and professional tone in all communications</li>
          <li>Proper attribution of sources and quotes</li>
          <li>Regular updates to developing stories</li>
        </ul>
        <h2>User-Generated Content</h2>
        <p>Comments and user submissions are moderated to ensure quality discourse. We reserve the right to remove content that violates our community guidelines, including spam, harassment, or misinformation.</p>
        <h2>Contact</h2>
        <p>For questions about our editorial policy or to report concerns, please contact our editorial team at <a href="mailto:cryploungeofficial@gmail.com">cryploungeofficial@gmail.com</a>.</p>
      `,
    },
    {
      slug: 'fact-check-policy',
      title: 'Fact-Check Policy',
      seoDescription: 'How CrypLounge verifies facts, evaluates sources, and handles corrections.',
      content: `
        <h2>Our Commitment to Accuracy</h2>
        <p>CrypLounge is dedicated to providing accurate and reliable information to our readers. Every article undergoes a rigorous fact-checking process before publication.</p>
        <h2>Verification Process</h2>
        <p>Our team cross-references claims against primary sources, official statements, and reputable industry data before a story is published.</p>
        <h2>Source Evaluation</h2>
        <p>We prioritize primary sources — official announcements, on-chain data, and verified statements — over secondary reporting.</p>
        <h2>Handling Uncertainty</h2>
        <p>Where facts are disputed or unconfirmed, we clearly label the uncertainty rather than presenting speculation as established fact.</p>
        <h2>Price and Market Data</h2>
        <p>Market figures are sourced from established data providers and are timestamped; prices are volatile and may change between writing and publication.</p>
        <h2>Correcting Errors</h2>
        <p>When an error is identified, we correct it promptly and transparently. See our <a href="/corrections-policy">Corrections Policy</a> for details.</p>
        <h2>Reader Contributions</h2>
        <p>Readers who spot an inaccuracy are encouraged to report it so we can investigate and correct it if warranted.</p>
        <h2>Contact</h2>
        <p>To flag a factual concern, contact us at <a href="mailto:cryploungeofficial@gmail.com">cryploungeofficial@gmail.com</a>.</p>
      `,
    },
    {
      slug: 'corrections-policy',
      title: 'Corrections Policy',
      seoDescription: 'How CrypLounge issues corrections and clarifications to published content.',
      content: `
        <h2>Our Commitment to Transparency</h2>
        <p>When we get something wrong, we correct it openly. This policy explains how we handle corrections and clarifications.</p>
        <h2>Types of Corrections</h2>
        <p>Corrections range from minor factual fixes to substantial changes affecting the meaning of an article. Each is handled proportionately to its significance.</p>
        <h2>Correction Process</h2>
        <p>Once an error is confirmed, the article is updated, and a correction note is appended describing what changed and when.</p>
        <h2>Correction Notation</h2>
        <p>Corrections are marked inline, for example: <em>"Correction: an earlier version of this article misstated the launch date."</em></p>
        <h2>Clarifications vs. Corrections</h2>
        <p>Clarifications add context without indicating a factual error; corrections indicate that published information was incorrect.</p>
        <h2>Reporting Errors</h2>
        <p>Readers can report suspected errors to our editorial team for review.</p>
        <h2>Archive Access</h2>
        <p>Original versions of corrected articles remain available in our version history for transparency.</p>
        <h2>Contact</h2>
        <p>To report an error, contact us at <a href="mailto:cryploungeofficial@gmail.com">cryploungeofficial@gmail.com</a>.</p>
      `,
    },
  ];

  for (const page of pages) {
    await db.legalPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        slug: page.slug,
        title: page.title,
        content: page.content.trim(),
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        seoTitle: `${page.title} - CrypLounge`,
        seoDescription: page.seoDescription,
        updatedById: ownerId,
      },
    });
  }
  console.log(`  legal pages: ${await db.legalPage.count()}`);
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
  console.log('Seeding CrypLoungeâ€¦');
  await seedPermissions();
  const owner = await seedUsers();
  await seedCategories();
  await seedArticles(owner.id);
  await seedProjectDirectory();
  await seedEvents();
  await seedFounders();
  await seedProjectCollections();
  await seedHomepageSections();
  await seedLegalPages(owner.id);
  await seedLanguages();
  console.log('Done.');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
