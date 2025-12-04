"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Plus, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role: string
  schoolId: string | null
  school?: {
    id: string
    name: string
  }
  createdAt: string
  studentProfile?: {
    totalXP: number
    level: number
  }
}

interface School {
  id: string
  name: string
  domain: string | null
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [editingSchoolId, setEditingSchoolId] = useState<string>("none")
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
    fetchSchools()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      } else if (res.status === 403) {
        // 권한 없음 - 로그인 페이지로 리다이렉트
        router.push('/auth/signin?callbackUrl=/admin/users')
      } else {
        console.error('API Error:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      // 네트워크 오류 등의 경우 로그인 페이지로 리다이렉트
      router.push('/auth/signin?callbackUrl=/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/schools')
      if (res.ok) {
        const data = await res.json()
        setSchools(data.schools)
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // 검색어 필터
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.school?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 역할 필터
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditingSchoolId(user.schoolId || "none")
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      // 기본 정보 업데이트
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          role: editingUser.role
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '사용자 정보 수정에 실패했습니다.')
        return
      }

      // 학교 정보 업데이트 (학생인 경우에만)
      if (editingUser.role === 'STUDENT' && (editingSchoolId === "none" ? null : editingSchoolId) !== editingUser.schoolId) {
        const schoolRes = await fetch(`/api/admin/students/${editingUser.id}/school`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: editingSchoolId === "none" ? null : editingSchoolId
          })
        })

        if (!schoolRes.ok) {
          const data = await schoolRes.json()
          alert(data.error || '학교 정보 수정에 실패했습니다.')
          return
        }
      }

      fetchUsers()
      setIsEditDialogOpen(false)
      setEditingUser(null)
      setEditingSchoolId("none")
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('사용자 정보 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchUsers()
        setIsDeleteDialogOpen(false)
        setUserToDelete(null)
      } else {
        const data = await res.json()
        alert(data.error || '사용자 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('사용자 삭제 중 오류가 발생했습니다.')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'TEACHER':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <Card>
        <CardHeader>
          <CardTitle>회원 관리</CardTitle>
          <CardDescription>전체 회원 정보를 조회하고 관리할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 이메일, 학교로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="STUDENT">학생</SelectItem>
                <SelectItem value="TEACHER">교사</SelectItem>
                <SelectItem value="ADMIN">관리자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 사용자 테이블 */}
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>학교</TableHead>
                    <TableHead>레벨</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        사용자가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role === 'STUDENT' ? '학생' : user.role === 'TEACHER' ? '교사' : '관리자'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.school?.name || '-'}</TableCell>
                        <TableCell>
                          {user.studentProfile ? `Lv.${user.studentProfile.level}` : '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserToDelete(user)
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

      {/* 사용자 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정보 수정</DialogTitle>
            <DialogDescription>
              사용자의 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  이름
                </Label>
                <Input
                  id="name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  이메일
                </Label>
                <Input
                  id="email"
                  value={editingUser.email}
                  disabled
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  역할
                </Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="역할을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">학생</SelectItem>
                    <SelectItem value="TEACHER">교사</SelectItem>
                    <SelectItem value="ADMIN">관리자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingUser.role === 'STUDENT' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="school" className="text-right">
                    학교
                  </Label>
                  <Select
                    value={editingSchoolId}
                    onValueChange={setEditingSchoolId}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="학교를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">없음</SelectItem>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateUser}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 사용자 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <p className="text-sm">
                <strong>이름:</strong> {userToDelete.name}
              </p>
              <p className="text-sm">
                <strong>이메일:</strong> {userToDelete.email}
              </p>
              <p className="text-sm">
                <strong>역할:</strong> {userToDelete.role}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}