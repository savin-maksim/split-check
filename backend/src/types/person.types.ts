export interface CreatePersonDTO {
  name: string;
  checkId: string;
}

export interface PersonResponse {
  id: string;
  name: string;
  checkId: string | null;
}

export interface AddPeopleToCheckDTO {
  names: string[]; // Массив имен для добавления нескольких участников сразу
  checkId: string;
}

export interface UpdatePersonDTO {
  name?: string;
} 