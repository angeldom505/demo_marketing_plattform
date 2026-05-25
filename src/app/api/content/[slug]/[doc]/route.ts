import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; doc: string }> }
) {
  const { slug, doc } = await params;

  const safeSlug = slug.replace(/[^a-z0-9-]/g, "");
  const safeDoc = doc.replace(/[^a-z0-9-]/g, "");

  if (!safeSlug || !safeDoc) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "desarrollos", safeSlug, `${safeDoc}.md`);

  try {
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
