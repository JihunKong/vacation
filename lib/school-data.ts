// 학교 데이터 (나이스 API 연동 전 샘플 데이터)
// 실제 나이스 학교 코드 형식: 지역코드(1자리) + 학교급코드(1자리) + 일련번호(5자리)

export interface SchoolData {
  neisCode: string
  name: string
  region: string
  district: string
  address: string
  schoolType: 'ELEMENTARY' | 'MIDDLE' | 'HIGH' | 'SPECIAL' | 'OTHER'
}

// 주요 지역별 샘플 학교 데이터
export const sampleSchools: SchoolData[] = [
  // 서울 지역 학교들
  {
    neisCode: "B100000001",
    name: "서울대학교사범대학부설고등학교",
    region: "서울특별시",
    district: "종로구",
    address: "서울특별시 종로구 대학로 64",
    schoolType: "HIGH"
  },
  {
    neisCode: "B100000002",
    name: "경기고등학교",
    region: "서울특별시",
    district: "강남구",
    address: "서울특별시 강남구 영동대로 643",
    schoolType: "HIGH"
  },
  {
    neisCode: "B100000003",
    name: "서울과학고등학교",
    region: "서울특별시",
    district: "종로구",
    address: "서울특별시 종로구 혜화로 63",
    schoolType: "HIGH"
  },
  {
    neisCode: "B200000001",
    name: "서울중학교",
    region: "서울특별시",
    district: "서초구",
    address: "서울특별시 서초구 서초대로 50",
    schoolType: "MIDDLE"
  },
  {
    neisCode: "B200000002",
    name: "대치중학교",
    region: "서울특별시",
    district: "강남구",
    address: "서울특별시 강남구 대치동 512",
    schoolType: "MIDDLE"
  },
  {
    neisCode: "B300000001",
    name: "서울교육대학교부설초등학교",
    region: "서울특별시",
    district: "서초구",
    address: "서울특별시 서초구 서초중앙로 96",
    schoolType: "ELEMENTARY"
  },
  
  // 경기도 지역 학교들
  {
    neisCode: "J100000001",
    name: "수원외국어고등학교",
    region: "경기도",
    district: "수원시",
    address: "경기도 수원시 영통구 창룡대로 263",
    schoolType: "HIGH"
  },
  {
    neisCode: "J100000002",
    name: "안양외국어고등학교",
    region: "경기도",
    district: "안양시",
    address: "경기도 안양시 동안구 부림로 163",
    schoolType: "HIGH"
  },
  {
    neisCode: "J200000001",
    name: "분당중학교",
    region: "경기도",
    district: "성남시",
    address: "경기도 성남시 분당구 분당로 201",
    schoolType: "MIDDLE"
  },
  
  // 부산 지역 학교들
  {
    neisCode: "C100000001",
    name: "부산과학고등학교",
    region: "부산광역시",
    district: "금정구",
    address: "부산광역시 금정구 장전로 111",
    schoolType: "HIGH"
  },
  {
    neisCode: "C100000002",
    name: "부산외국어고등학교",
    region: "부산광역시",
    district: "연제구",
    address: "부산광역시 연제구 월드컵대로 271",
    schoolType: "HIGH"
  },
  
  // 대구 지역 학교들
  {
    neisCode: "D100000001",
    name: "대구과학고등학교",
    region: "대구광역시",
    district: "수성구",
    address: "대구광역시 수성구 동대구로 27",
    schoolType: "HIGH"
  },
  
  // 인천 지역 학교들
  {
    neisCode: "E100000001",
    name: "인천과학고등학교",
    region: "인천광역시",
    district: "중구",
    address: "인천광역시 중구 영종대로 277",
    schoolType: "HIGH"
  },
  {
    neisCode: "E100000002",
    name: "인천외국어고등학교",
    region: "인천광역시",
    district: "부평구",
    address: "인천광역시 부평구 부평대로 283",
    schoolType: "HIGH"
  },
  
  // 광주 지역 학교들
  {
    neisCode: "F100000001",
    name: "광주과학고등학교",
    region: "광주광역시",
    district: "북구",
    address: "광주광역시 북구 첨단과기로 235",
    schoolType: "HIGH"
  },
  
  // 대전 지역 학교들
  {
    neisCode: "G100000001",
    name: "대전과학고등학교",
    region: "대전광역시",
    district: "유성구",
    address: "대전광역시 유성구 대학로 111",
    schoolType: "HIGH"
  },
  
  // 울산 지역 학교들
  {
    neisCode: "H100000001",
    name: "울산과학고등학교",
    region: "울산광역시",
    district: "울주군",
    address: "울산광역시 울주군 언양읍 대학길 50",
    schoolType: "HIGH"
  },
  
  // 세종 지역 학교들
  {
    neisCode: "I100000001",
    name: "세종과학예술영재학교",
    region: "세종특별자치시",
    district: "세종시",
    address: "세종특별자치시 달빛1로 265",
    schoolType: "HIGH"
  },
  
  // 강원도 지역 학교들
  {
    neisCode: "K100000001",
    name: "민족사관고등학교",
    region: "강원도",
    district: "횡성군",
    address: "강원도 횡성군 안흥면 봉화로 800",
    schoolType: "HIGH"
  },
  
  // 충청북도 지역 학교들
  {
    neisCode: "M100000001",
    name: "청주외국어고등학교",
    region: "충청북도",
    district: "청주시",
    address: "충청북도 청주시 흥덕구 대농로 88",
    schoolType: "HIGH"
  },
  
  // 충청남도 지역 학교들
  {
    neisCode: "N100000001",
    name: "천안북일고등학교",
    region: "충청남도",
    district: "천안시",
    address: "충청남도 천안시 동남구 단대로 69",
    schoolType: "HIGH"
  },
  
  // 전라북도 지역 학교들
  {
    neisCode: "P100000001",
    name: "전주외국어고등학교",
    region: "전라북도",
    district: "전주시",
    address: "전라북도 전주시 완산구 용머리로 20",
    schoolType: "HIGH"
  },
  
  // 전라남도 지역 학교들
  {
    neisCode: "Q100000001",
    name: "목포과학고등학교",
    region: "전라남도",
    district: "목포시",
    address: "전라남도 목포시 영산로 111",
    schoolType: "HIGH"
  },
  
  // 경상북도 지역 학교들
  {
    neisCode: "R100000001",
    name: "포항제철고등학교",
    region: "경상북도",
    district: "포항시",
    address: "경상북도 포항시 남구 동해안로 6213",
    schoolType: "HIGH"
  },
  
  // 경상남도 지역 학교들
  {
    neisCode: "S100000001",
    name: "경남과학고등학교",
    region: "경상남도",
    district: "진주시",
    address: "경상남도 진주시 진성면 진성로 333",
    schoolType: "HIGH"
  },
  
  // 제주도 지역 학교들
  {
    neisCode: "T100000001",
    name: "제주외국어고등학교",
    region: "제주특별자치도",
    district: "제주시",
    address: "제주특별자치도 제주시 애월읍 평화로 2715",
    schoolType: "HIGH"
  }
]

// 학교 검색 함수
export function searchSchools(query: string): SchoolData[] {
  const lowercaseQuery = query.toLowerCase()
  return sampleSchools.filter(school => 
    school.name.toLowerCase().includes(lowercaseQuery) ||
    school.region.toLowerCase().includes(lowercaseQuery) ||
    school.district.toLowerCase().includes(lowercaseQuery)
  )
}

// 나이스 코드로 학교 찾기
export function getSchoolByNeisCode(neisCode: string): SchoolData | undefined {
  return sampleSchools.find(school => school.neisCode === neisCode)
}

// 지역별 학교 목록 가져오기
export function getSchoolsByRegion(region: string): SchoolData[] {
  return sampleSchools.filter(school => school.region === region)
}

// 학교 유형별 목록 가져오기
export function getSchoolsByType(schoolType: string): SchoolData[] {
  return sampleSchools.filter(school => school.schoolType === schoolType)
}