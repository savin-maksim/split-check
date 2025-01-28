import { Router } from 'express'
import authRoutes from './auth.routes'
import checkRoutes from './check.routes'
import personRoutes from './person.routes'
import costRoutes from './cost.routes'
import groupRoutes from './group.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/checks', checkRoutes)
router.use('/people', personRoutes)
router.use('/costs', costRoutes)
router.use('/groups', groupRoutes)

export default router 