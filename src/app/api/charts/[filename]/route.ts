// Route: GET /api/charts/[filename]
// Serves HTML chart files from plots folder

import {NextRequest, NextResponse} from "next/server";
import {readFile} from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{filename: string}>} // ← CHANGED: params is now a Promise
) {
  try {
    // Await the params
    const {filename} = await params; // ← CHANGED: Added await

    // Security: Only allow HTML files and prevent directory traversal
    if (!filename.endsWith(".html") || filename.includes("..")) {
      return NextResponse.json(
        {error: "Invalid file requested"},
        {status: 400}
      );
    }

    const filePath = path.join(process.cwd(), "plots", filename);
    const fileContent = await readFile(filePath, "utf-8");

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "text/html"
      }
    });
  } catch (error: any) {
    console.error("Chart file error:", error);
    return NextResponse.json({error: "Chart file not found"}, {status: 404});
  }
}
