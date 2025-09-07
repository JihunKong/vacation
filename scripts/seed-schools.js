const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const sampleSchools = [
  // 서울
  { neisCode: "B10001", name: "서울고등학교", region: "서울", district: "서초구", address: "서울특별시 서초구 효령로 197", schoolType: "HIGH" },
  { neisCode: "B10002", name: "경기고등학교", region: "서울", district: "강남구", address: "서울특별시 강남구 영동대로 643", schoolType: "HIGH" },
  { neisCode: "B10003", name: "서울중학교", region: "서울", district: "종로구", address: "서울특별시 종로구 새문안로 69", schoolType: "MIDDLE" },
  { neisCode: "B10004", name: "서울초등학교", region: "서울", district: "중구", address: "서울특별시 중구 소공로 46", schoolType: "ELEMENTARY" },
  { neisCode: "B10005", name: "경복고등학교", region: "서울", district: "종로구", address: "서울특별시 종로구 자하문로 90", schoolType: "HIGH" },
  
  // 경기
  { neisCode: "J10001", name: "수원고등학교", region: "경기", district: "수원시", address: "경기도 수원시 팔달구 수원천로 392번길 44", schoolType: "HIGH" },
  { neisCode: "J10002", name: "성남고등학교", region: "경기", district: "성남시", address: "경기도 성남시 수정구 제일로 135", schoolType: "HIGH" },
  { neisCode: "J10003", name: "안양중학교", region: "경기", district: "안양시", address: "경기도 안양시 만안구 양화로 37번길 36", schoolType: "MIDDLE" },
  { neisCode: "J10004", name: "고양초등학교", region: "경기", district: "고양시", address: "경기도 고양시 덕양구 중앙로 633", schoolType: "ELEMENTARY" },
  { neisCode: "J10005", name: "분당고등학교", region: "경기", district: "성남시", address: "경기도 성남시 분당구 불정로 174", schoolType: "HIGH" },
  
  // 부산
  { neisCode: "C10001", name: "부산고등학교", region: "부산", district: "동래구", address: "부산광역시 동래구 금강로 59번길 47", schoolType: "HIGH" },
  { neisCode: "C10002", name: "부산진고등학교", region: "부산", district: "부산진구", address: "부산광역시 부산진구 당감로 17", schoolType: "HIGH" },
  { neisCode: "C10003", name: "해운대중학교", region: "부산", district: "해운대구", address: "부산광역시 해운대구 대천로 67", schoolType: "MIDDLE" },
  { neisCode: "C10004", name: "부산초등학교", region: "부산", district: "동구", address: "부산광역시 동구 중앙대로 250", schoolType: "ELEMENTARY" },
  
  // 대구
  { neisCode: "D10001", name: "경북고등학교", region: "대구", district: "중구", address: "대구광역시 중구 대봉로 260", schoolType: "HIGH" },
  { neisCode: "D10002", name: "대구고등학교", region: "대구", district: "수성구", address: "대구광역시 수성구 달구벌대로 2397", schoolType: "HIGH" },
  { neisCode: "D10003", name: "대구중학교", region: "대구", district: "남구", address: "대구광역시 남구 중앙대로 220", schoolType: "MIDDLE" },
  
  // 인천
  { neisCode: "E10001", name: "인천고등학교", region: "인천", district: "미추홀구", address: "인천광역시 미추홀구 매소홀로 344", schoolType: "HIGH" },
  { neisCode: "E10002", name: "제물포고등학교", region: "인천", district: "중구", address: "인천광역시 중구 제물량로 238", schoolType: "HIGH" },
  { neisCode: "E10003", name: "인천중학교", region: "인천", district: "남동구", address: "인천광역시 남동구 인주대로 755", schoolType: "MIDDLE" },
  
  // 광주
  { neisCode: "F10001", name: "광주고등학교", region: "광주", district: "동구", address: "광주광역시 동구 필문대로 420", schoolType: "HIGH" },
  { neisCode: "F10002", name: "광주제일고등학교", region: "광주", district: "북구", address: "광주광역시 북구 중외공원로 121", schoolType: "HIGH" },
  
  // 대전
  { neisCode: "G10001", name: "대전고등학교", region: "대전", district: "중구", address: "대전광역시 중구 대종로 235", schoolType: "HIGH" },
  { neisCode: "G10002", name: "충남고등학교", region: "대전", district: "서구", address: "대전광역시 서구 문정로 170", schoolType: "HIGH" },
  
  // 울산
  { neisCode: "H10001", name: "울산고등학교", region: "울산", district: "중구", address: "울산광역시 중구 함월로 51", schoolType: "HIGH" },
  { neisCode: "H10002", name: "울산중학교", region: "울산", district: "남구", address: "울산광역시 남구 중앙로 180", schoolType: "MIDDLE" },
  
  // 강원
  { neisCode: "K10001", name: "춘천고등학교", region: "강원", district: "춘천시", address: "강원도 춘천시 충열로 64", schoolType: "HIGH" },
  { neisCode: "K10002", name: "강릉고등학교", region: "강원", district: "강릉시", address: "강원도 강릉시 종합운동장길 24", schoolType: "HIGH" },
  
  // 충북
  { neisCode: "M10001", name: "청주고등학교", region: "충북", district: "청주시", address: "충청북도 청주시 상당구 대성로 122번길 14", schoolType: "HIGH" },
  { neisCode: "M10002", name: "충주고등학교", region: "충북", district: "충주시", address: "충청북도 충주시 예성로 266", schoolType: "HIGH" },
  
  // 충남
  { neisCode: "N10001", name: "천안고등학교", region: "충남", district: "천안시", address: "충청남도 천안시 동남구 승방2길 27", schoolType: "HIGH" },
  { neisCode: "N10002", name: "공주고등학교", region: "충남", district: "공주시", address: "충청남도 공주시 우금티로 618", schoolType: "HIGH" },
  
  // 전북
  { neisCode: "P10001", name: "전주고등학교", region: "전북", district: "전주시", address: "전라북도 전주시 완산구 관선3길 12", schoolType: "HIGH" },
  { neisCode: "P10002", name: "전북고등학교", region: "전북", district: "전주시", address: "전라북도 전주시 덕진구 전주천동로 317", schoolType: "HIGH" },
  
  // 전남
  { neisCode: "Q10001", name: "광양고등학교", region: "전남", district: "광양시", address: "전라남도 광양시 광양읍 서천1길 10", schoolType: "HIGH" },
  { neisCode: "Q10002", name: "목포고등학교", region: "전남", district: "목포시", address: "전라남도 목포시 영산로 111", schoolType: "HIGH" },
  
  // 경북
  { neisCode: "R10001", name: "포항고등학교", region: "경북", district: "포항시", address: "경상북도 포항시 북구 중흥로 52", schoolType: "HIGH" },
  { neisCode: "R10002", name: "안동고등학교", region: "경북", district: "안동시", address: "경상북도 안동시 대안로 95", schoolType: "HIGH" },
  
  // 경남
  { neisCode: "S10001", name: "창원고등학교", region: "경남", district: "창원시", address: "경상남도 창원시 성산구 창이대로 706번길 16", schoolType: "HIGH" },
  { neisCode: "S10002", name: "김해고등학교", region: "경남", district: "김해시", address: "경상남도 김해시 김해대로 2436", schoolType: "HIGH" },
  
  // 제주
  { neisCode: "T10001", name: "제주고등학교", region: "제주", district: "제주시", address: "제주특별자치도 제주시 1100로 3233", schoolType: "HIGH" },
  { neisCode: "T10002", name: "서귀포고등학교", region: "제주", district: "서귀포시", address: "제주특별자치도 서귀포시 신서로 48번길 9", schoolType: "HIGH" },
  
  // 세종
  { neisCode: "I10001", name: "세종고등학교", region: "세종", district: "세종시", address: "세종특별자치시 달빛로 180", schoolType: "HIGH" },
  { neisCode: "I10002", name: "세종여자고등학교", region: "세종", district: "세종시", address: "세종특별자치시 도움1로 25", schoolType: "HIGH" },
]

async function seedSchools() {
  console.log('Seeding schools...')
  
  for (const school of sampleSchools) {
    try {
      await prisma.school.create({
        data: {
          neisCode: school.neisCode,
          name: school.name,
          region: school.region,
          district: school.district,
          address: school.address,
          schoolType: school.schoolType,
        }
      })
      console.log(`Created school: ${school.name}`)
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`School already exists: ${school.name}`)
      } else {
        console.error(`Error creating school ${school.name}:`, error)
      }
    }
  }
  
  console.log('Schools seeded successfully!')
  await prisma.$disconnect()
}

seedSchools().catch(console.error)