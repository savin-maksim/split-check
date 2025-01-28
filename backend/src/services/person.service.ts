import { PrismaClient } from '@prisma/client';
import { CreatePersonDTO, PersonResponse, AddPeopleToCheckDTO, UpdatePersonDTO } from '../types/person.types';

const prisma = new PrismaClient();

export class PersonService {
  async addPersonToCheck(data: CreatePersonDTO): Promise<PersonResponse> {
    const person = await prisma.person.create({
      data: {
        name: data.name,
        check: {
          connect: { id: data.checkId }
        }
      },
      select: {
        id: true,
        name: true,
        checkId: true
      }
    });

    return person;
  }

  async addPeopleToCheck(data: AddPeopleToCheckDTO): Promise<PersonResponse[]> {
    const people = await Promise.all(
      data.names.map(name =>
        prisma.person.create({
          data: {
            name,
            check: {
              connect: { id: data.checkId }
            }
          },
          select: {
            id: true,
            name: true,
            checkId: true
          }
        })
      )
    );

    return people;
  }

  async getPeopleInCheck(checkId: string): Promise<PersonResponse[]> {
    const people = await prisma.person.findMany({
      where: {
        checkId
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        checkId: true
      }
    });

    return people;
  }

  async updatePerson(personId: string, checkId: string, data: UpdatePersonDTO): Promise<PersonResponse> {
    const person = await prisma.person.update({
      where: {
        id: personId,
        checkId
      },
      data,
      select: {
        id: true,
        name: true,
        checkId: true
      }
    });

    return person;
  }

  async deletePerson(personId: string, checkId: string): Promise<void> {
    await prisma.person.delete({
      where: {
        id: personId,
        checkId
      }
    });
  }

  async deleteAllPeopleFromCheck(checkId: string): Promise<void> {
    await prisma.person.deleteMany({
      where: {
        checkId
      }
    });
  }
} 