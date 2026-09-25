import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import { allowedImage, MAX_IMAGE_BYTES, storeImage } from "@/lib/upload";

export async function POST(req: NextRequest) {
  if (!(await getUser())) return NextResponse.json({ error: "Log in first" }, { status: 401 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!allowedImage(file.type)) return NextResponse.json({ error: "Use PNG, JPG, WebP or GIF" }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Max 4 MB" }, { status: 400 });
  try {
    return NextResponse.json({ url: await storeImage(file) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Image uploads aren't set up yet" }, { status: 503 });
  }
}
