import { NextResponse } from "next/server";
import { googleAuth } from "@/lib/googleAuth";

export async function GET() {
  try {
    const project = await googleAuth.getProjectId();

    return NextResponse.json({
      success: true,
      project,
    });

  } catch (error:any) {
    return NextResponse.json({
      success:false,
      error:error.message,
    });
  }
}