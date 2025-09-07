import { NextRequest, NextResponse } from "next/server"
import { searchSchoolsFromNEIS } from "@/lib/neis-api"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "검색어는 최소 2자 이상 입력해주세요." },
        { status: 400 }
      )
    }

    // NEIS API를 사용하여 실제 학교 검색
    const schools = await searchSchoolsFromNEIS(query)

    return NextResponse.json({
      schools,
      count: schools.length
    })
  } catch (error) {
    console.error("School search error:", error)
    return NextResponse.json(
      { error: "학교 검색 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}