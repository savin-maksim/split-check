import { Person } from '@prisma/client'

export interface CreateGroupDTO {
  name: string
}

export interface UpdateGroupDTO {
  name: string
}

export interface GroupResponse {
  id: string
  name: string
  userId: string
  members: Person[]
  createdAt: Date
  updatedAt: Date
}

export interface AddMembersDTO {
  memberIds: string[]
} 