export interface Person {
  id: string;
  name: string;
}

export interface Transfer {
  from: Person;
  to: Person;
  amount: number;
} 