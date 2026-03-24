import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = [
    { name: "テクノロジー", slug: "technology" },
    { name: "キャリア", slug: "career" },
    { name: "生産性", slug: "productivity" },
    { name: "ライフ", slug: "life" },
    { name: "ビジネス", slug: "business" },
    { name: "デザイン", slug: "design" },
    { name: "学び", slug: "learning" },
    { name: "社会", slug: "society" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: {},
    });
  }

  // Seed tags
  const tags = [
    "AI",
    "Web開発",
    "個人開発",
    "キャリア",
    "生産性",
    "読書",
    "ライティング",
    "マーケティング",
    "UI/UX",
    "リモートワーク",
  ];

  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  // Seed prompt templates
  const templates = [
    {
      key: "organize",
      name: "アイデア整理",
      template: "Analyze the idea and provide structured metadata including title, summary, type, importance, and platform fit.",
      description: "インボックスのアイデアを自動整理する際のプロンプト",
    },
    {
      key: "generate_note",
      name: "note記事生成",
      template: "Generate a long-form blog post for note platform (800-2000 characters).",
      description: "note向けの長文記事を生成",
    },
    {
      key: "generate_x",
      name: "Xポスト生成",
      template: "Generate a tweet for X/Twitter (max 280 characters).",
      description: "X向けの短文ポストを生成",
    },
    {
      key: "generate_linkedin",
      name: "LinkedInポスト生成",
      template: "Generate a professional LinkedIn post (500-1500 characters).",
      description: "LinkedIn向けのプロフェッショナルなポストを生成",
    },
    {
      key: "suggest_questions",
      name: "深掘り質問",
      template: "Generate thought-provoking follow-up questions to deepen the idea.",
      description: "アイデアを深掘りするための質問を生成",
    },
    {
      key: "recommend_related",
      name: "関連アイデア推薦",
      template: "Find and score related ideas from the existing collection.",
      description: "関連するアイデアを推薦",
    },
  ];

  for (const tmpl of templates) {
    await prisma.promptTemplate.upsert({
      where: { key: tmpl.key },
      create: tmpl,
      update: {},
    });
  }

  // Seed sample ideas
  const sampleIdeas = [
    {
      content:
        "AIツールを使った個人開発の生産性が劇的に上がっている。特にコード生成と設計フェーズでの活用が効果的。具体的な数字や事例を交えて記事にしたい。",
      title: "AI時代の個人開発術",
      summary: "AIツールを活用した個人開発の生産性向上について、具体的な事例を交えた記事のアイデア",
      status: "organized",
      ideaType: "howto",
      importance: 4,
      platformFit: JSON.stringify({ note: 90, x: 50, linkedin: 75 }),
    },
    {
      content:
        "リモートワークが当たり前になった今、オフィス出社の価値をどう再定義すべきか。単なる場所の提供ではなく、セレンディピティの設計として考える。",
      status: "organized",
      ideaType: "opinion",
      importance: 3,
      platformFit: JSON.stringify({ note: 70, x: 65, linkedin: 85 }),
    },
    {
      content: "最近読んだ本で面白かったフレームワーク。意思決定における「可逆性」の概念。",
      status: "inbox",
      importance: 2,
    },
  ];

  for (const idea of sampleIdeas) {
    await prisma.idea.create({ data: idea });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
