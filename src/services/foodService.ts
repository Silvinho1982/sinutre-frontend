import { api } from '@/lib/api';
import type { Food } from '@/types/food';

export type FoodPayload = Omit<Food, 'id'>;

export async function getFoods(search = ''): Promise<Food[]> {
  const response = await api.get<Food[]>('/foods', {
    params: search ? { search } : undefined,
  });
  return response.data;
}

export async function createFood(food: FoodPayload): Promise<Food> {
  const response = await api.post<Food>('/foods', food);
  return response.data;
}

export async function updateFood(
  id: number,
  food: FoodPayload,
): Promise<Food> {
  const response = await api.put<Food>(`/foods/${id}`, food);
  return response.data;
}

export async function deleteFood(id: number): Promise<void> {
  await api.delete(`/foods/${id}`);
}

export async function searchFoods(search: string): Promise<Food[]> {
  return getFoods(search);
}
