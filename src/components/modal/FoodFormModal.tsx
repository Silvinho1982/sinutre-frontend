import { useEffect, useState } from 'react';
import { X } from '@phosphor-icons/react';
import {
  createFood,
  updateFood,
  type FoodPayload,
} from '@/services/foodService';
import { getApiErrorDetails, getApiErrorMessage } from '@/lib/api';
import type { Food } from '@/types/food';

interface FoodFormModalProps {
  open: boolean;
  food: Food | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

interface FormState {
  name: string;
  caloriesPer100g: string;
  carbsPer100g: string;
  proteinPer100g: string;
  fatPer100g: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  caloriesPer100g: '',
  carbsPer100g: '',
  proteinPer100g: '',
  fatPer100g: '',
};

function toForm(food: Food | null): FormState {
  if (!food) return EMPTY_FORM;
  return {
    name: food.name,
    caloriesPer100g: String(food.caloriesPer100g),
    carbsPer100g: String(food.carbsPer100g),
    proteinPer100g: String(food.proteinPer100g),
    fatPer100g: String(food.fatPer100g),
  };
}

export function FoodFormModal({ open, food, onClose, onSaved }: FoodFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toForm(food));
      setErrors({});
      setError('');
    }
  }, [open, food]);

  if (!open) return null;

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) {
      next.name = 'Informe um nome com pelo menos 2 caracteres.';
    }

    const numericFields: Array<[keyof FormState, string, number]> = [
      ['caloriesPer100g', 'Calorias', 1000],
      ['carbsPer100g', 'Carboidratos', 100],
      ['proteinPer100g', 'Proteínas', 100],
      ['fatPer100g', 'Gorduras', 100],
    ];

    for (const [field, label, max] of numericFields) {
      const raw = form[field].trim();
      const value = Number(raw.replace(',', '.'));

      if (raw === '') {
        next[field] = `${label} é obrigatório.`;
      } else if (!Number.isFinite(value)) {
        next[field] = `${label} deve ser um número.`;
      } else if (value < 0) {
        next[field] = `${label} não pode ser negativo.`;
      } else if (value > max) {
        next[field] = `${label} deve ser menor ou igual a ${max}.`;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (!validate()) return;

    const payload: FoodPayload = {
      name: form.name.trim(),
      caloriesPer100g: Number(form.caloriesPer100g.replace(',', '.')),
      carbsPer100g: Number(form.carbsPer100g.replace(',', '.')),
      proteinPer100g: Number(form.proteinPer100g.replace(',', '.')),
      fatPer100g: Number(form.fatPer100g.replace(',', '.')),
    };

    try {
      setSaving(true);
      if (food) {
        await updateFood(food.id, payload);
      } else {
        await createFood(payload);
      }
      await onSaved();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível salvar o alimento.'));
      setErrors(getApiErrorDetails(err));
    } finally {
      setSaving(false);
    }
  }

  const estimatedCalories =
    (Number(form.carbsPer100g.replace(',', '.')) || 0) * 4 +
    (Number(form.proteinPer100g.replace(',', '.')) || 0) * 4 +
    (Number(form.fatPer100g.replace(',', '.')) || 0) * 9;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
      <div className="card bg-base-100 w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <form className="card-body gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="card-title text-xl">
                {food ? 'Editar alimento' : 'Novo alimento'}
              </h2>
              <p className="text-sm text-base-content/60">
                Valores nutricionais por 100 g.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square"
              onClick={onClose}
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div role="alert" className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">Nome do alimento</span>
            <input
              className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
              placeholder="Ex.: Arroz integral cozido"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              autoFocus
            />
            {errors.name && <span className="text-error text-xs mt-1">{errors.name}</span>}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                ['caloriesPer100g', 'Calorias (kcal)', '0 a 1000', '0.1'],
                ['carbsPer100g', 'Carboidratos (g)', '0 a 100', '0.1'],
                ['proteinPer100g', 'Proteínas (g)', '0 a 100', '0.1'],
                ['fatPer100g', 'Gorduras (g)', '0 a 100', '0.1'],
              ] as Array<[keyof FormState, string, string, string]>
            ).map(([field, label, hint, step]) => (
              <label className="form-control w-full" key={field}>
                <span className="label-text mb-1 font-medium">{label}</span>
                <input
                  type="number"
                  min="0"
                  step={step}
                  className={`input input-bordered w-full ${errors[field] ? 'input-error' : ''}`}
                  value={form[field]}
                  onChange={(event) => update(field, event.target.value)}
                />
                {errors[field] ? (
                  <span className="text-error text-xs mt-1">{errors[field]}</span>
                ) : (
                  <span className="text-base-content/40 text-xs mt-1">{hint}</span>
                )}
              </label>
            ))}
          </div>

          <div className="rounded-box bg-base-200 px-4 py-3 text-sm flex items-center justify-between">
            <span className="text-base-content/60">Calorias estimadas pelos macros</span>
            <span className="font-bold">{estimatedCalories.toFixed(0)} kcal</span>
          </div>

          <div className="modal-action mt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="loading loading-spinner loading-sm" />}
              {food ? 'Salvar alterações' : 'Cadastrar alimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
