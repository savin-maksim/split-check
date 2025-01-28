import { Response } from 'express';
import { PersonService } from '../services/person.service';
import { CheckService } from '../services/check.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreatePersonDTO, AddPeopleToCheckDTO, UpdatePersonDTO } from '../types/person.types';

const personService = new PersonService();
const checkService = new CheckService();

export class PersonController {
  async addPersonToCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checkId = req.params.checkId;
      const data: CreatePersonDTO = {
        ...req.body,
        checkId
      };

      // Проверяем, что чек существует и принадлежит пользователю
      const check = await checkService.getCheckById(checkId, req.user.id);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      const person = await personService.addPersonToCheck(data);
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async addPeopleToCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checkId = req.params.checkId;
      const data: AddPeopleToCheckDTO = {
        ...req.body,
        checkId
      };

      // Проверяем, что чек существует и принадлежит пользователю
      const check = await checkService.getCheckById(checkId, req.user.id);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      const people = await personService.addPeopleToCheck(data);
      res.status(201).json(people);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getPeopleInCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checkId = req.params.checkId;

      // Проверяем, что чек существует и принадлежит пользователю
      const check = await checkService.getCheckById(checkId, req.user.id);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      const people = await personService.getPeopleInCheck(checkId);
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updatePerson(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checkId = req.params.checkId;
      const personId = req.params.personId;
      const data: UpdatePersonDTO = req.body;

      // Проверяем, что чек существует и принадлежит пользователю
      const check = await checkService.getCheckById(checkId, req.user.id);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      const person = await personService.updatePerson(personId, checkId, data);
      res.json(person);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async deletePerson(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checkId = req.params.checkId;
      const personId = req.params.personId;

      // Проверяем, что чек существует и принадлежит пользователю
      const check = await checkService.getCheckById(checkId, req.user.id);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      await personService.deletePerson(personId, checkId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 