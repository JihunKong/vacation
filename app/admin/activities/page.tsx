"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Search, Edit, Trash2, Plus, Activity, Calendar, Clock, User, Trophy } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Activity {
  id: string
  studentId: string
  title: string
  category: string
  minutes: number
  description?: string
  xpEarned: number
  date: string
  createdAt: string
  student: {
    user: {
      name: string
      email: string
      school?: {
        name: string
      }
    }
  }
}

const CATEGORY_LABELS: { [key: string]: string } = {
  'STUDY': '📚 학습',
  'EXERCISE': '💪 운동',
  'READING': '📖 독서',
  'HOBBY': '🎨 취미',
  'VOLUNTEER': '🤝 봉사',
  'OTHER': '✨ 기타'
}

export default function ActivityManagement() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, searchQuery, categoryFilter, dateFilter])

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/admin/activities')
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    // 검색어 필터
    if (searchQuery) {
      filtered = filtered.filter(activity => 
        activity.student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.student.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        activity.student.user.school?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 카테고리 필터
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter(activity => activity.category === categoryFilter)
    }

    // 날짜 필터
    if (dateFilter) {
      filtered = filtered.filter(activity => 
        activity.date.startsWith(dateFilter)
      )
    }

    setFilteredActivities(filtered)
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setIsEditDialogOpen(true)
  }

  const handleUpdateActivity = async () => {
    if (!editingActivity) return

    try {
      const res = await fetch(`/api/admin/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingActivity.title,
          category: editingActivity.category,
          minutes: editingActivity.minutes,
          description: editingActivity.description,
          xpEarned: editingActivity.xpEarned
        })
      })

      if (res.ok) {
        fetchActivities()
        setIsEditDialogOpen(false)
        setEditingActivity(null)
      } else {
        const data = await res.json()
        alert(data.error || '활동 정보 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to update activity:', error)
      alert('활동 정보 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return

    try {
      const res = await fetch(`/api/admin/activities/${activityToDelete.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchActivities()
        setIsDeleteDialogOpen(false)
        setActivityToDelete(null)
      } else {
        const data = await res.json()
        alert(data.error || '활동 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete activity:', error)
      alert('활동 삭제 중 오류가 발생했습니다.')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins > 0 ? `${mins}분` : ''}`
    }
    return `${mins}분`
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                활동 관리
              </CardTitle>
              <CardDescription>전체 학생 활동 기록을 조회하고 관리할 수 있습니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 이메일, 학교, 설명으로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="카테고리 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="STUDY">📚 학습</SelectItem>
                <SelectItem value="EXERCISE">💪 운동</SelectItem>
                <SelectItem value="READING">📖 독서</SelectItem>
                <SelectItem value="HOBBY">🎨 취미</SelectItem>
                <SelectItem value="VOLUNTEER">🤝 봉사</SelectItem>
                <SelectItem value="OTHER">✨ 기타</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[180px]"
            />
          </div>

          {/* 활동 테이블 */}
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>사용자</TableHead>
                    <TableHead>학교</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>활동 제목</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>획득 XP</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        활동 기록이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {format(new Date(activity.date), 'MM/dd', { locale: ko })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{activity.student.user.name}</div>
                            <div className="text-xs text-gray-500">{activity.student.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{activity.student.user.school?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CATEGORY_LABELS[activity.category] || activity.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="truncate" title={activity.title}>
                            {activity.title}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="truncate" title={activity.description || '-'}>
                            {activity.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(activity.minutes)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="gap-1">
                            <Trophy className="h-3 w-3" />
                            {activity.xpEarned} XP
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditActivity(activity)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActivityToDelete(activity)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 활동 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>활동 정보 수정</DialogTitle>
            <DialogDescription>
              활동 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {editingActivity && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">
                  사용자
                </Label>
                <Input
                  id="user"
                  value={`${editingActivity.student.user.name} (${editingActivity.student.user.email})`}
                  disabled
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  카테고리
                </Label>
                <Select
                  value={editingActivity.category}
                  onValueChange={(value) => setEditingActivity({ ...editingActivity, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDY">📚 학습</SelectItem>
                    <SelectItem value="EXERCISE">💪 운동</SelectItem>
                    <SelectItem value="READING">📖 독서</SelectItem>
                    <SelectItem value="HOBBY">🎨 취미</SelectItem>
                    <SelectItem value="VOLUNTEER">🤝 봉사</SelectItem>
                    <SelectItem value="OTHER">✨ 기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  제목
                </Label>
                <Input
                  id="title"
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minutes" className="text-right">
                  시간 (분)
                </Label>
                <Input
                  id="minutes"
                  type="number"
                  value={editingActivity.minutes}
                  onChange={(e) => setEditingActivity({ ...editingActivity, minutes: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="xp" className="text-right">
                  획득 XP
                </Label>
                <Input
                  id="xp"
                  type="number"
                  value={editingActivity.xpEarned}
                  onChange={(e) => setEditingActivity({ ...editingActivity, xpEarned: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right mt-2">
                  설명
                </Label>
                <Textarea
                  id="description"
                  value={editingActivity.description || ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateActivity}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 활동 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>활동 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 활동 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          {activityToDelete && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <strong>사용자:</strong> {activityToDelete.student.user.name}
              </p>
              <p className="text-sm">
                <strong>날짜:</strong> {format(new Date(activityToDelete.date), 'yyyy년 MM월 dd일', { locale: ko })}
              </p>
              <p className="text-sm">
                <strong>카테고리:</strong> {CATEGORY_LABELS[activityToDelete.category]}
              </p>
              <p className="text-sm">
                <strong>제목:</strong> {activityToDelete.title}
              </p>
              <p className="text-sm">
                <strong>설명:</strong> {activityToDelete.description || '-'}
              </p>
              <p className="text-sm">
                <strong>획득 XP:</strong> {activityToDelete.xpEarned} XP
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteActivity}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}