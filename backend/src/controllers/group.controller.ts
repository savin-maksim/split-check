import { Request, Response } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { CreateGroupDTO, UpdateGroupDTO, AddMembersDTO } from '../types/group.types'

const prisma = new PrismaClient()

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

class GroupController {
  async createGroup(req: Request, res: Response) {
    try {
      const { name, members } = req.body
      const userId = req.user.id

      if (!Array.isArray(members)) {
        return res.status(400).json({ message: 'Members should be an array of names' })
      }

      const result = await prisma.$transaction(async (tx: TransactionClient) => {
        const group = await tx.group.create({
          data: {
            name,
            user: {
              connect: { id: userId }
            }
          }
        })

        const createdMembers = await Promise.all(
          members.map(memberName =>
            tx.person.create({
              data: {
                name: memberName,
                groups: {
                  connect: { id: group.id }
                }
              }
            })
          )
        )

        return await tx.group.findUnique({
          where: { id: group.id },
          include: {
            members: true,
            user: true
          }
        })
      })

      res.status(201).json(result)
    } catch (error) {
      console.error('Error creating group:', error)
      res.status(500).json({ message: 'Error creating group', error })
    }
  }

  async getGroups(req: Request, res: Response) {
    try {
      const userId = req.user.id
      
      const groups = await prisma.group.findMany({
        where: {
          userId: userId
        },
        include: {
          members: true,
          user: true
        }
      })

      res.json(groups)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching groups', error })
    }
  }

  async getGroupById(req: Request, res: Response) {
    try {
      const { groupId } = req.params
      const userId = req.user.id

      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          userId: userId
        },
        include: {
          members: true,
          user: true
        }
      })

      if (!group) {
        return res.status(404).json({ message: 'Group not found' })
      }

      res.json(group)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching group', error })
    }
  }

  async updateGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params
      const { name } = req.body
      const userId = req.user.id

      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          userId: userId
        }
      })

      if (!group) {
        return res.status(404).json({ message: 'Group not found or unauthorized' })
      }

      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: { name },
        include: {
          members: true,
          user: true
        }
      })

      res.json(updatedGroup)
    } catch (error) {
      res.status(500).json({ message: 'Error updating group', error })
    }
  }

  async deleteGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params
      const userId = req.user.id

      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          userId: userId
        }
      })

      if (!group) {
        return res.status(404).json({ message: 'Group not found or unauthorized' })
      }

      await prisma.group.delete({
        where: { id: groupId }
      })

      res.status(204).send()
    } catch (error) {
      res.status(500).json({ message: 'Error deleting group', error })
    }
  }

  async addMembers(req: Request, res: Response) {
    try {
      const { groupId } = req.params
      const { members } = req.body
      const userId = req.user.id

      if (!Array.isArray(members)) {
        return res.status(400).json({ message: 'Members should be an array of names' })
      }

      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          userId: userId
        }
      })

      if (!group) {
        return res.status(404).json({ message: 'Group not found or unauthorized' })
      }

      const result = await prisma.$transaction(async (tx: TransactionClient) => {
        const createdMembers = await Promise.all(
          members.map(memberName =>
            tx.person.create({
              data: {
                name: memberName,
                groups: {
                  connect: { id: groupId }
                }
              }
            })
          )
        )

        return await tx.group.findUnique({
          where: { id: groupId },
          include: {
            members: true,
            user: true
          }
        })
      })

      res.json(result)
    } catch (error) {
      console.error('Error adding members:', error)
      res.status(500).json({ message: 'Error adding members', error })
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { groupId, memberId } = req.params
      const userId = req.user.id

      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          userId: userId
        }
      })

      if (!group) {
        return res.status(404).json({ message: 'Group not found or unauthorized' })
      }

      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: {
          members: {
            disconnect: { id: memberId }
          }
        },
        include: {
          members: true,
          user: true
        }
      })

      res.json(updatedGroup)
    } catch (error) {
      res.status(500).json({ message: 'Error removing member', error })
    }
  }
}

export const groupController = new GroupController() 