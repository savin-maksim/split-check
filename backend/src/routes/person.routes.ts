import { Router } from 'express';
import { PersonController } from '../controllers/person.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();
const personController = new PersonController();

// Все маршруты защищены middleware аутентификации
router.use(auth);

// Маршруты для работы с участниками конкретного чека
router.post('/checks/:checkId/people', (req, res, next) => {
  personController.addPersonToCheck(req, res).catch(next);
});

router.post('/checks/:checkId/people/batch', (req, res, next) => {
  personController.addPeopleToCheck(req, res).catch(next);
});

router.get('/checks/:checkId/people', (req, res, next) => {
  personController.getPeopleInCheck(req, res).catch(next);
});

router.put('/checks/:checkId/people/:personId', (req, res, next) => {
  personController.updatePerson(req, res).catch(next);
});

router.delete('/checks/:checkId/people/:personId', (req, res, next) => {
  personController.deletePerson(req, res).catch(next);
});

export default router; 