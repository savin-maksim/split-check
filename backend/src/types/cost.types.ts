export interface CreateCostDTO {
  title: string;
  quantity: number;
  pricePerUnit: number;
  checkId: string;
  paidByIds: string[];      // ID людей, которые оплатили
  splitBetweenIds: string[]; // ID людей, между которыми делится позиция
}

export interface CostResponse {
  id: string;
  title: string;
  quantity: number;
  pricePerUnit: number;
  amount: number;
  checkId: string;
  createdAt: Date;
  paidBy: Array<{
    id: string;
    name: string;
  }>;
  splitBetween: Array<{
    id: string;
    name: string;
  }>;
}

export interface UpdateCostDTO {
  title?: string;
  quantity?: number;
  pricePerUnit?: number;
  paidByIds?: string[];
  splitBetweenIds?: string[];
}

export interface CostWithDetails extends CostResponse {
  check: {
    id: string;
    title: string;
  };
} 