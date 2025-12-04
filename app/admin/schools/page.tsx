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
import { Search, Edit, Trash2, Plus, School, Users } from "lucide-react"

interface School {
  id: string
  name: string
  neisCode: string
  schoolType: string
  region?: string | null
  district?: string | null
  address?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
  }
}

export default function SchoolManagement() {
  const [schools, setSchools] = useState<School[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null)
  const [newSchoolName, setNewSchoolName] = useState("")
  const [newSchoolNeisCode, setNewSchoolNeisCode] = useState("")
  const [newSchoolType, setNewSchoolType] = useState("HIGH")

  useEffect(() => {
    fetchSchools()
  }, [])

  useEffect(() => {
    filterSchools()
  }, [schools, searchQuery])

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/admin/schools')
      if (res.ok) {
        const data = await res.json()
        setSchools(data.schools)
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSchools = () => {
    let filtered = schools

    if (searchQuery) {
      filtered = filtered.filter(school => 
        school.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredSchools(filtered)
  }

  const handleCreateSchool = async () => {
    if (!newSchoolName.trim() || !newSchoolNeisCode.trim()) return

    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSchoolName,
          neisCode: newSchoolNeisCode,
          schoolType: newSchoolType
        })
      })

      if (res.ok) {
        fetchSchools()
        setIsCreateDialogOpen(false)
        setNewSchoolName("")
        setNewSchoolNeisCode("")
        setNewSchoolType("HIGH")
      } else {
        const data = await res.json()
        alert(data.error || '학교 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to create school:', error)
      alert('학교 생성 중 오류가 발생했습니다.')
    }
  }

  const handleEditSchool = (school: School) => {
    setEditingSchool(school)
    setIsEditDialogOpen(true)
  }

  const handleUpdateSchool = async () => {
    if (!editingSchool) return

    try {
      const res = await fetch(`/api/admin/schools/${editingSchool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editingSchool.name,
          neisCode: editingSchool.neisCode,
          schoolType: editingSchool.schoolType
        })
      })

      if (res.ok) {
        fetchSchools()
        setIsEditDialogOpen(false)
        setEditingSchool(null)
      } else {
        const data = await res.json()
        alert(data.error || '학교 정보 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to update school:', error)
      alert('학교 정보 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteSchool = async () => {
    if (!schoolToDelete) return

    try {
      const res = await fetch(`/api/admin/schools/${schoolToDelete.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchSchools()
        setIsDeleteDialogOpen(false)
        setSchoolToDelete(null)
      } else {
        const data = await res.json()
        alert(data.error || '학교 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete school:', error)
      alert('학교 삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                학교 관리
              </CardTitle>
              <CardDescription>전체 학교 정보를 조회하고 관리할 수 있습니다.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              새 학교 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 검색 */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="학교명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* 학교 테이블 */}
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학교명</TableHead>
                    <TableHead>나이스 코드</TableHead>
                    <TableHead>학교 유형</TableHead>
                    <TableHead>등록 학생 수</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        등록된 학교가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.neisCode}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {school.schoolType === 'ELEMENTARY' ? '초등학교' :
                             school.schoolType === 'MIDDLE' ? '중학교' :
                             school.schoolType === 'HIGH' ? '고등학교' :
                             school.schoolType === 'SPECIAL' ? '특수학교' : '기타'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            {school._count?.users || 0}명
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(school.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSchool(school)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSchoolToDelete(school)
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

      {/* 학교 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 학교 추가</DialogTitle>
            <DialogDescription>
              새로운 학교를 추가합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                학교명
              </Label>
              <Input
                id="new-name"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                className="col-span-3"
                placeholder="예: 서울고등학교"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-neis" className="text-right">
                나이스 코드
              </Label>
              <Input
                id="new-neis"
                value={newSchoolNeisCode}
                onChange={(e) => setNewSchoolNeisCode(e.target.value)}
                className="col-span-3"
                placeholder="예: 7010001"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-type" className="text-right">
                학교 유형
              </Label>
              <Select value={newSchoolType} onValueChange={setNewSchoolType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="학교 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELEMENTARY">초등학교</SelectItem>
                  <SelectItem value="MIDDLE">중학교</SelectItem>
                  <SelectItem value="HIGH">고등학교</SelectItem>
                  <SelectItem value="SPECIAL">특수학교</SelectItem>
                  <SelectItem value="OTHER">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setNewSchoolName("")
              setNewSchoolNeisCode("")
              setNewSchoolType("HIGH")
            }}>
              취소
            </Button>
            <Button onClick={handleCreateSchool}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 학교 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>학교 정보 수정</DialogTitle>
            <DialogDescription>
              학교 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {editingSchool && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  학교명
                </Label>
                <Input
                  id="edit-name"
                  value={editingSchool.name}
                  onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-neis" className="text-right">
                  나이스 코드
                </Label>
                <Input
                  id="edit-neis"
                  value={editingSchool.neisCode}
                  onChange={(e) => setEditingSchool({ ...editingSchool, neisCode: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  학교 유형
                </Label>
                <Select
                  value={editingSchool.schoolType}
                  onValueChange={(value) => setEditingSchool({ ...editingSchool, schoolType: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="학교 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELEMENTARY">초등학교</SelectItem>
                    <SelectItem value="MIDDLE">중학교</SelectItem>
                    <SelectItem value="HIGH">고등학교</SelectItem>
                    <SelectItem value="SPECIAL">특수학교</SelectItem>
                    <SelectItem value="OTHER">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateSchool}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 학교 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>학교 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 학교를 삭제하시겠습니까? 
              {schoolToDelete?._count?.users && schoolToDelete._count.users > 0 && (
                <span className="block mt-2 text-red-600">
                  ⚠️ 주의: 이 학교에는 {schoolToDelete._count.users}명의 학생이 등록되어 있습니다.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {schoolToDelete && (
            <div className="py-4">
              <p className="text-sm">
                <strong>학교명:</strong> {schoolToDelete.name}
              </p>
              <p className="text-sm">
                <strong>등록 학생 수:</strong> {schoolToDelete._count?.users || 0}명
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteSchool}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}