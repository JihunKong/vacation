import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, School, Activity, TrendingUp } from "lucide-react"

export default async function AdminDashboard() {
  // 통계 데이터 가져오기
  const [userCount, schoolCount, activityCount, todayActivityCount] = await Promise.all([
    prisma.user.count(),
    prisma.school.count(),
    prisma.activity.count(),
    prisma.activity.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ])

  const stats = [
    {
      title: "전체 사용자",
      value: userCount,
      icon: Users,
      description: "가입한 전체 사용자 수",
      color: "text-blue-600"
    },
    {
      title: "등록된 학교",
      value: schoolCount,
      icon: School,
      description: "시스템에 등록된 학교 수",
      color: "text-green-600"
    },
    {
      title: "전체 활동",
      value: activityCount,
      icon: Activity,
      description: "기록된 전체 활동 수",
      color: "text-purple-600"
    },
    {
      title: "오늘 활동",
      value: todayActivityCount,
      icon: TrendingUp,
      description: "오늘 기록된 활동 수",
      color: "text-orange-600"
    }
  ]

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">관리자 대시보드</h2>
        <p className="mt-1 text-sm text-gray-600">
          시스템 전체 현황을 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 관리 기능</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/admin/users" className="block p-3 rounded-lg hover:bg-gray-50 border">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">회원 관리</p>
                    <p className="text-xs text-gray-500">사용자 정보 조회 및 수정</p>
                  </div>
                </div>
              </a>
              <a href="/admin/schools" className="block p-3 rounded-lg hover:bg-gray-50 border">
                <div className="flex items-center">
                  <School className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">학교 관리</p>
                    <p className="text-xs text-gray-500">학교 정보 관리 및 통계</p>
                  </div>
                </div>
              </a>
              <a href="/admin/activities" className="block p-3 rounded-lg hover:bg-gray-50 border">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">활동 관리</p>
                    <p className="text-xs text-gray-500">전체 활동 내역 조회</p>
                  </div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 가입 사용자</CardTitle>
            <CardDescription>최근 7일간 가입한 사용자</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentUsers />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function RecentUsers() {
  const recentUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    include: {
      school: true
    }
  })

  if (recentUsers.length === 0) {
    return <p className="text-sm text-gray-500">최근 가입한 사용자가 없습니다.</p>
  }

  return (
    <div className="space-y-2">
      {recentUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{user.role}</p>
            <p className="text-xs text-gray-400">
              {user.school?.name || '학교 미설정'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}