import { Router } from 'express'
import { RequestHandler } from 'express'
import { groupController } from '../controllers/group.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// Apply auth middleware to all group routes
router.use(authMiddleware as RequestHandler)

// Group management routes
router.route('/')
  .post(groupController.createGroup as RequestHandler)
  .get(groupController.getGroups as RequestHandler)

router.route('/:groupId')
  .get(groupController.getGroupById as RequestHandler)
  .put(groupController.updateGroup as RequestHandler)
  .delete(groupController.deleteGroup as RequestHandler)

// Group members management routes
router.route('/:groupId/members')
  .post(groupController.addMembers as RequestHandler)

router.route('/:groupId/members/:memberId')
  .delete(groupController.removeMember as RequestHandler)

export default router 