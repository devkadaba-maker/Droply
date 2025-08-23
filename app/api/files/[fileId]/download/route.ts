import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.fileId;
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // 1. Find the file record in your database
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file || !file.fileUrl) {
      return NextResponse.json({ error: "File not found or URL is missing" }, { status: 404 });
    }

    // 2. Fetch the ACTUAL file from the ImageKit URL
    const fileResponse = await fetch(file.fileUrl);

    if (!fileResponse.ok) {
      // If ImageKit returns an error, forward it
      return NextResponse.json({ error: `Storage provider returned an error: ${fileResponse.statusText}` }, { status: 500 });
    }

    // 3. Get the file's content as a readable stream
    const fileStream = fileResponse.body;

    // 4. THIS IS THE KEY: Return a new Response with the file stream and special headers
    // This tells the browser to treat the response as a file to be downloaded.
    return new Response(fileStream, {
      headers: {
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Content-Type": fileResponse.headers.get("Content-Type") || "application/octet-stream",
      },
    });

  } catch (error) {
    console.error("Error in download route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}