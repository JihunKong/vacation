import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { School, Mail, User, Shield, Calendar, Settings } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import SchoolChangeButton from "@/components/school/school-change-button"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      school: true,
      studentProfile: {
        include: {
          badges: true
        }
      }
    }
  })
  
  if (!user) {
    redirect("/login")
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">내 프로필</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>계정 기본 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.studentProfile?.avatarImageUrl || ""} />
                <AvatarFallback>
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">이름:</span>
                <span className="font-medium">{user.name || "미설정"}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">이메일:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">역할:</span>
                <Badge variant={user.role === 'TEACHER' ? 'default' : 'secondary'}>
                  {user.role === 'TEACHER' ? '교사' : '학생'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">가입일:</span>
                <span className="font-medium">
                  {format(user.createdAt, 'yyyy년 M월 d일', { locale: ko })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 학교 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>학교 정보</span>
              <SchoolChangeButton 
                currentSchool={user.school}
                currentRole={user.role}
              />
            </CardTitle>
            <CardDescription>
              {user.school ? '등록된 학교 정보' : '학교를 설정하여 더 많은 기능을 이용하세요'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.school ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">{user.school.name}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">지역:</span>
                    <span className="ml-2 font-medium">
                      {user.school.region} {user.school.district}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">주소:</span>
                    <span className="ml-2 font-medium">{user.school.address}</span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">학교 유형:</span>
                    <Badge variant="outline" className="ml-2">
                      {user.school.schoolType === 'ELEMENTARY' && '초등학교'}
                      {user.school.schoolType === 'MIDDLE' && '중학교'}
                      {user.school.schoolType === 'HIGH' && '고등학교'}
                      {user.school.schoolType === 'SPECIAL' && '특수학교'}
                      {user.school.schoolType === 'OTHER' && '기타'}
                    </Badge>
                  </div>
                </div>
                
                {user.role === 'TEACHER' && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">교사 권한:</span> 같은 학교 학생들의 학습 현황을 확인할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <School className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  아직 학교가 설정되지 않았습니다
                </p>
                <SchoolChangeButton 
                  currentSchool={null}
                  currentRole={user.role}
                  showAsButton={true}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 게임 통계 (학생만) */}
        {user.role === 'STUDENT' && user.studentProfile && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>게임 통계</CardTitle>
              <CardDescription>나의 학습 게임 진행 상황</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">레벨</p>
                  <p className="text-2xl font-bold">Level {user.studentProfile.level}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">총 경험치</p>
                  <p className="text-2xl font-bold">{user.studentProfile.totalXP} XP</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">총 학습 시간</p>
                  <p className="text-2xl font-bold">{user.studentProfile.totalMinutes}분</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">연속 출석</p>
                  <p className="text-2xl font-bold">{user.studentProfile.currentStreak}일</p>
                </div>
              </div>
              
              {/* 능력치 */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">능력치</h4>
                <div className="grid gap-2 md:grid-cols-5">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">STR</p>
                    <p className="font-bold">{user.studentProfile.strength}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">INT</p>
                    <p className="font-bold">{user.studentProfile.intelligence}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">DEX</p>
                    <p className="font-bold">{user.studentProfile.dexterity}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">CHA</p>
                    <p className="font-bold">{user.studentProfile.charisma}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">VIT</p>
                    <p className="font-bold">{user.studentProfile.vitality}</p>
                  </div>
                </div>
              </div>
              
              {/* 배지 */}
              {user.studentProfile.badges.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">획득한 배지</h4>
                  <div className="flex gap-2 flex-wrap">
                    {user.studentProfile.badges.map(badge => (
                      <Badge key={badge.id} variant="secondary">
                        {badge.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}