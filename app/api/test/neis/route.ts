import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("q") || "서울고등학교"
    
    // 환경변수 확인
    const apiKey = process.env.NEIS_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "NEIS API key is not configured",
        envCheck: {
          hasApiKey: false,
          apiKeyLength: 0
        }
      })
    }
    
    // NEIS API 호출
    const baseUrl = 'https://open.neis.go.kr/hub/schoolInfo'
    const params = new URLSearchParams({
      KEY: apiKey,
      Type: 'json',
      pIndex: '1',
      pSize: '10',
      SCHUL_NM: query
    })
    
    const apiUrl = `${baseUrl}?${params.toString()}`
    console.log('Calling NEIS API:', apiUrl.replace(apiKey, 'HIDDEN'))
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `NEIS API error: ${response.status}`,
        statusText: response.statusText
      })
    }
    
    const data = await response.json()
    
    // 결과 파싱
    let schools = []
    if (data.schoolInfo && data.schoolInfo[0]) {
      const result = data.schoolInfo[0].head[1].RESULT
      
      if (result && result.CODE === 'INFO-000') {
        schools = data.schoolInfo[0].row || []
      }
    }
    
    return NextResponse.json({
      success: true,
      query,
      envCheck: {
        hasApiKey: true,
        apiKeyLength: apiKey.length
      },
      totalCount: schools.length,
      schools: schools.map((school: any) => ({
        neisCode: school.SD_SCHUL_CODE,
        name: school.SCHUL_NM,
        region: school.ATPT_OFCDC_SC_NM,
        district: school.LCTN_SC_NM,
        address: school.ORG_RDNMA,
        schoolType: school.SCHUL_KND_SC_NM,
        tel: school.ORG_TELNO,
        website: school.HMPG_ADRES
      })),
      rawData: data
    })
  } catch (error) {
    console.error('NEIS test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}