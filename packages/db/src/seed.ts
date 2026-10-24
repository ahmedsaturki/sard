/**
 * Seed data — demo content model, admin user, sample posts (Arabic + English).
 * Run: pnpm db:seed
 */
import { eq } from "drizzle-orm";
import { createSardDb, closeDb } from "./client.js";
import {
  collections,
  content,
  users,
  sites,
  knowledgeEntities
} from "./schema.js";

const postsCollection = {
  slug: "posts",
  title: "Posts",
  isSingleton: false,
  createRoles: ["owner", "admin", "editor", "author"] ,
  description: "Blog articles with Portable Text bodies",
  fields: [
    { name: "title", type: "text", required: true, label: { en: "Title", ar: "العنوان" } },
    { name: "body", type: "portableText", required: false, label: { en: "Body", ar: "المحتوى" } },
    { name: "excerpt", type: "text", required: false, label: { en: "Excerpt", ar: "المقتطف" } },
    { name: "tags", type: "array", items: "text", required: false },
    { name: "coverImage", type: "media", required: false },
    { name: "directAnswer", type: "text", required: false, description: "40-60 word AEO summary" }
  ]
};

const pagesCollection = {
  slug: "pages",
  title: "Pages",
  isSingleton: false,
  createRoles: ["owner", "admin", "editor"] ,
  fields: [
    { name: "title", type: "text", required: true },
    { name: "body", type: "portableText", required: false }
  ]
};

const settingsCollection = {
  slug: "site-settings",
  title: "Site Settings",
  isSingleton: true,
  createRoles: ["owner", "admin"] ,
  fields: [
    { name: "siteName", type: "text", required: true },
    { name: "tagline", type: "text", required: false },
    { name: "defaultLocale", type: "select", options: ["en", "ar"] }
  ]
};

// Demo Portable Text document (bilingual)
const demoPostAr = {
  _type: "content",
  blocks: [
    { _type: "block", style: "h1", children: [{ _type: "span", text: "مرحباً بالعالم", marks: [] }] },
    {
      _type: "block",
      style: "normal",
      children: [
        { _type: "span", text: "هذا ", marks: [] },
        { _type: "span", text: "سرد", marks: ["strong"] },
        { _type: "span", text: " — نظام تشغيل المحتوى من بُنية لابز.", marks: [] }
      ]
    }
  ]
};

const demoPostEn = {
  _type: "content",
  blocks: [
    { _type: "block", style: "h1", children: [{ _type: "span", text: "Hello World", marks: [] }] },
    {
      _type: "block",
      style: "normal",
      children: [
        { _type: "span", text: "This is ", marks: [] },
        { _type: "span", text: "Sard", marks: ["strong"] },
        { _type: "span", text: " — the Content Operating System by Bunya Labs.", marks: [] }
      ]
    }
  ]
};

async function main(): Promise<void> {
  const db = createSardDb({ connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/sard" });

  // Site
  const [site] = await db
    .insert(sites)
    .values({ slug: "demo", name: "Sard Demo Site", defaultLocale: "ar", locales: ["ar", "en"] })
    .onConflictDoNothing({ target: sites.slug })
    .returning();

  // Collections (idempotent by slug)
  for (const c of [postsCollection, pagesCollection, settingsCollection]) {
    await db
      .insert(collections)
      .values({ ...c, fields: c.fields as Record<string, unknown>[] })
      .onConflictDoNothing({ target: collections.slug });
  }

  // Posts collection id for seeding content
  const [postsCol] = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, "posts"));
  if (!postsCol) throw new Error("posts collection not found after seed");

  // Demo content (en + ar localized)
  const enPost = (
    await db
      .insert(content)
      .values({
        collectionId: postsCol.id,
        slug: "hello-world",
        locale: "en",
        body: demoPostEn as Record<string, unknown>,
        data: { title: "Hello World", excerpt: "First post" },
        status: "published",
        publishedAt: new Date()
      })
      .onConflictDoNothing({ target: [content.collectionId, content.slug, content.locale] })
      .returning()
  )[0];

  if (enPost) {
    await db
      .insert(content)
      .values({
        collectionId: postsCol.id,
        slug: "hello-world",
        locale: "ar",
        sourceId: enPost.id,
        body: demoPostAr as Record<string, unknown>,
        data: { title: "مرحباً بالعالم", excerpt: "المقال الأول" },
        status: "published",
        publishedAt: new Date()
      })
      .onConflictDoNothing({ target: [content.collectionId, content.slug, content.locale] });
  }

  // Admin user (password: sard-admin-123 — for local dev only!)
  // NOTE: hash placeholder; real deployments use argon2 at user creation time.
  await db
    .insert(users)
    .values({
      email: "admin@bunya.dev",
      passwordHash: "$placeholder$argon2id$1234567890",
      name: "Sard Admin",
      role: "owner",
      mfaEnabled: false
    })
    .onConflictDoNothing({ target: users.email });

  // Knowledge entity
  await db
    .insert(knowledgeEntities)
    .values({
      type: "organization",
      name: "Bunya Labs",
      schemaOrgType: "Organization",
      description: "Bunya Labs — بُنية لابز",
      properties: { website: "https://sard.bunya.dev" }
    })
    .onConflictDoNothing({ target: [knowledgeEntities.type, knowledgeEntities.name] });

  console.log("[sard:db] Seed complete. Site:", site?.name ?? "(existing)");
  await closeDb();
}

main().catch((err: unknown) => {
  console.error("[sard:db] Seed failed:", err);
  process.exit(1);
});
