import { useEffect, useMemo, useState } from 'react';
import { Warning } from '@phosphor-icons/react';
import type { FoodItem, MealCategory, MealState } from '@/types/meal';
import { MealItemForm } from './MealItemForm';
import { MealItemsTable } from './MealItemsTable';
import { MealMacrosSummary } from './MealMacrosSummary';
import { MealMetadataForm } from './MealMetadataForm';
import { MEAL_CATEGORY_BY_ID } from '@/constants/mealCategories';
import { createMeal } from '@/services/mealService';
import { getApiErrorDetails, getApiErrorMessage } from '@/lib/api';

interface AddMealModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  typeMeal: MealCategory | null;
  onMealCreated: () => Promise<void>;
}

function nowForInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export function AddMealModal({
  open,
  typeMeal,
  onClose,
  onMealCreated,
}: AddMealModalProps) {
  const [meal, setMeal] = useState<MealState>({
    description: '',
    type: typeMeal ?? 'snack',
    eatTime: nowForInput(),
  });
  const [items, setItems] = useState<FoodItem[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMeal({
        description: '',
        type: typeMeal ?? 'snack',
        eatTime: nowForInput(),
      });
      setItems([]);
      setError('');
      setSaving(false);
    }
  }, [open, typeMeal]);

  function handleAddItem(item: FoodItem) {
    setItems((current) => [...current, item]);
  }

  function handleRemoveItem(item: FoodItem) {
    setItems((current) => current.filter((x) => x.id !== item.id));
  }

  async function handleSaveMeal() {
    setError('');

    if (!meal.eatTime) {
      setError('Informe a data e o horário da refeição.');
      return;
    }

    if (items.length === 0) {
      setError('Adicione pelo menos um alimento à refeição.');
      return;
    }

    try {
      setSaving(true);
      await createMeal({
        ...meal,
        eatTime: new Date(meal.eatTime).toISOString(),
        items: items.map((item) => ({
          foodId: item.foodId,
          grams: item.grams,
        })),
      });
      await onMealCreated();
      onClose();
    } catch (err) {
      const details = getApiErrorDetails(err);
      setError(
        Object.values(details)[0] ??
          getApiErrorMessage(err, 'Não foi possível salvar a refeição.'),
      );
    } finally {
      setSaving(false);
    }
  }

  const macros = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.carbs += item.carbs;
          acc.proteins += item.protein;
          acc.fats += item.fat;
          acc.calories += item.calories;
          return acc;
        },
        {
          carbs: 0,
          proteins: 0,
          fats: 0,
          calories: 0,
          caloriesGoal: 0,
        },
      ),
    [items],
  );

  const category = typeMeal ? MEAL_CATEGORY_BY_ID[typeMeal] : null;

  if (!category) {
    return null;
  }

  return (
    <div className={`modal ${open ? 'modal-open' : ''}`} role="dialog">
      <div className="modal-box max-w-6xl">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-1">
          Adicionar {category.label.toLowerCase()}
        </h2>
        <p className="text-sm text-base-content/60 mb-5">
          Selecione alimentos já cadastrados e informe a quantidade em gramas.
        </p>

        {error && (
          <div role="alert" className="alert alert-error mb-4 text-sm">
            <Warning size={18} />
            <span>{error}</span>
          </div>
        )}

        <MealMacrosSummary macros={macros} />
        <MealMetadataForm meal={meal} setMeal={setMeal} />

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Itens da refeição</h3>
          <MealItemForm onAdd={handleAddItem} />
        </div>

        <MealItemsTable items={items} onRemove={handleRemoveItem} />

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveMeal}
            disabled={saving}
          >
            {saving && <span className="loading loading-spinner loading-sm" />}
            Salvar refeição
          </button>
        </div>
      </div>
    </div>
  );
}
