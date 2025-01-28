import { PrismaClient } from '@prisma/client'
import { CreateGroupDTO, UpdateGroupDTO, GroupResponse } from '../types/group.types'

const prisma = new PrismaClient()

export class GroupService {
  async createGroup(userId: string, data: CreateGroupDTO): Promise<GroupResponse> {
    const group = await prisma.group.create({
      data: {
        ...data,
        userId
      },
      include: {
        members: true
      }
    })

    return group
  }

  async getGroups(userId: string): Promise<GroupResponse[]> {
    const groups = await prisma.group.findMany({
      where: {
        userId
      },
      include: {
        members: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return groups
  }

  async getGroupById(groupId: string, userId: string): Promise<GroupResponse | null> {
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        userId
      },
      include: {
        members: true
      }
    })

    return group
  }

  async updateGroup(groupId: string, userId: string, data: UpdateGroupDTO): Promise<GroupResponse> {
    const group = await prisma.group.update({
      where: {
        id: groupId,
        userId
      },
      data,
      include: {
        members: true
      }
    })

    return group
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    await prisma.group.delete({
      where: {
        id: groupId,
        userId
      }
    })
  }

  async addMembers(groupId: string, userId: string, memberIds: string[]): Promise<GroupResponse> {
    const group = await prisma.group.update({
      where: {
        id: groupId,
        userId
      },
      data: {
        members: {
          connect: memberIds.map(id => ({ id }))
        }
      },
      include: {
        members: true
      }
    })

    return group
  }

  async removeMember(groupId: string, userId: string, memberId: string): Promise<GroupResponse> {
    const group = await prisma.group.update({
      where: {
        id: groupId,
        userId
      },
      data: {
        members: {
          disconnect: { id: memberId }
        }
      },
      include: {
        members: true
      }
    })

    return group
  }
} 