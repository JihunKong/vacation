// NEIS Open API 연동
// API 문서: https://open.neis.go.kr/portal/guide/actApiRequest

interface NEISSchoolInfo {
  SCHUL_NM: string          // 학교명
  ORG_RDNMA: string         // 도로명주소
  SCHUL_KND_SC_NM: string   // 학교종류명
  ATPT_OFCDC_SC_CODE: string // 시도교육청코드
  ATPT_OFCDC_SC_NM: string   // 시도교육청명
  SD_SCHUL_CODE: string      // 표준학교코드
  LCTN_SC_NM: string        // 지역명
  FOND_SC_NM: string        // 설립구분
  ENG_SCHUL_NM: string      // 영문학교명
  TEL_NO: string            // 전화번호
  HMPG_ADRES: string        // 홈페이지주소
  COEDU_SC_NM: string       // 남녀공학구분명
  FOAS_MEMRD: string        // 개교기념일
  ORG_RDNZC: string         // 도로명우편번호
  ORG_RDNDA: string         // 도로명상세주소
  INDST_SPECL_CCCCL_EXST_YN: string // 산업체특별학급존재여부
  HS_GNRL_BUSNS_SC_NM: string       // 고등학교일반실업구분명
  SPCLY_PURPS_HS_ORD_NM: string     // 특수목적고등학교계열명
}

interface NEISAPIResponse {
  schoolInfo?: [
    {
      head: [
        { list_total_count: number },
        { RESULT?: { CODE: string; MESSAGE: string } }
      ]
    },
    {
      row: NEISSchoolInfo[]
    }
  ]
}

export async function searchSchoolsFromNEIS(query: string) {
  const apiKey = process.env.NEIS_API_KEY
  
  if (!apiKey) {
    console.error('NEIS API key is not configured')
    // 폴백: 기존 샘플 데이터 사용
    const { searchSchools } = await import('./school-data')
    return searchSchools(query)
  }

  try {
    // NEIS API URL 구성
    const baseUrl = 'https://open.neis.go.kr/hub/schoolInfo'
    const params = new URLSearchParams({
      KEY: apiKey,
      Type: 'json',
      pIndex: '1',
      pSize: '100',
      SCHUL_NM: query  // 학교명으로 검색
    })

    const response = await fetch(`${baseUrl}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`NEIS API error: ${response.status}`)
    }

    const data: NEISAPIResponse = await response.json()
    
    // API 응답 체크
    if (!data.schoolInfo || !data.schoolInfo[0]) {
      // RESULT 객체 확인 (데이터가 없는 경우)
      if (data && typeof data === 'object' && 'RESULT' in data) {
        const result = (data as any).RESULT
        if (result && result.CODE === 'INFO-200') {
          console.log('No schools found for query:', query)
          return []
        }
      }
      return []
    }

    // schoolInfo[1]에 실제 데이터가 있는지 확인
    if (!data.schoolInfo[1]) {
      console.log('No school data in response for query:', query)
      return []
    }

    const result = data.schoolInfo[0].head[1].RESULT
    if (result && result.CODE !== 'INFO-000') {
      console.error('NEIS API error:', result.MESSAGE)
      return []
    }

    // 데이터 변환 - row가 없을 수도 있음
    const rows = data.schoolInfo[1].row
    if (!rows || !Array.isArray(rows)) {
      console.log('No row data found for query:', query)
      return []
    }

    const schools = rows.map(school => {
      // 학교 종류 매핑
      let schoolType: 'ELEMENTARY' | 'MIDDLE' | 'HIGH' | 'SPECIAL' | 'OTHER' = 'OTHER'
      if (school.SCHUL_KND_SC_NM.includes('초등')) {
        schoolType = 'ELEMENTARY'
      } else if (school.SCHUL_KND_SC_NM.includes('중학')) {
        schoolType = 'MIDDLE'
      } else if (school.SCHUL_KND_SC_NM.includes('고등')) {
        schoolType = 'HIGH'
      } else if (school.SCHUL_KND_SC_NM.includes('특수')) {
        schoolType = 'SPECIAL'
      }

      return {
        neisCode: school.SD_SCHUL_CODE,
        name: school.SCHUL_NM,
        region: school.ATPT_OFCDC_SC_NM, // 시도교육청명
        district: school.LCTN_SC_NM || '', // 지역명
        address: school.ORG_RDNMA || school.ORG_RDNDA || '',
        schoolType
      }
    })

    return schools
  } catch (error) {
    console.error('Failed to fetch from NEIS API:', error)
    // 폴백: 기존 샘플 데이터 사용
    const { searchSchools } = await import('./school-data')
    return searchSchools(query)
  }
}

// 특정 시도교육청의 학교 목록 가져오기
export async function getSchoolsByRegion(regionCode: string, pageIndex: number = 1) {
  const apiKey = process.env.NEIS_API_KEY
  
  if (!apiKey) {
    console.error('NEIS API key is not configured')
    return []
  }

  try {
    const baseUrl = 'https://open.neis.go.kr/hub/schoolInfo'
    const params = new URLSearchParams({
      KEY: apiKey,
      Type: 'json',
      pIndex: pageIndex.toString(),
      pSize: '1000',
      ATPT_OFCDC_SC_CODE: regionCode // 시도교육청코드
    })

    const response = await fetch(`${baseUrl}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`NEIS API error: ${response.status}`)
    }

    const data: NEISAPIResponse = await response.json()
    
    if (!data.schoolInfo || !data.schoolInfo[0]) {
      return []
    }

    const result = data.schoolInfo[0].head[1].RESULT
    if (result && result.CODE !== 'INFO-000') {
      console.error('NEIS API error:', result.MESSAGE)
      return []
    }

    return data.schoolInfo[1].row
  } catch (error) {
    console.error('Failed to fetch from NEIS API:', error)
    return []
  }
}

// 시도교육청 코드
export const REGION_CODES = {
  'B10': '서울특별시교육청',
  'C10': '부산광역시교육청',
  'D10': '대구광역시교육청',
  'E10': '인천광역시교육청',
  'F10': '광주광역시교육청',
  'G10': '대전광역시교육청',
  'H10': '울산광역시교육청',
  'I10': '세종특별자치시교육청',
  'J10': '경기도교육청',
  'K10': '강원도교육청',
  'M10': '충청북도교육청',
  'N10': '충청남도교육청',
  'P10': '전라북도교육청',
  'Q10': '전라남도교육청',
  'R10': '경상북도교육청',
  'S10': '경상남도교육청',
  'T10': '제주특별자치도교육청'
}