import { useEffect, useState } from 'react';
import {
  BowlFood,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
  Warning,
} from '@phosphor-icons/react';

import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { FoodFormModal } from '@/components/modal/FoodFormModal';
import { deleteFood, getFoods } from '@/services/foodService';
import { getApiErrorMessage } from '@/lib/api';
import type { Food } from '@/types/food';

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export function DietFoodPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);

  const [deleting, setDeleting] = useState<Food | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const delay = search.trim() ? 350 : 0;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await getFoods(search.trim());
        if (!active) return;
        setFoods(data);
        setError('');
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err, 'Não foi possível carregar os alimentos.'));
      } finally {
        if (active) setLoading(false);
      }
    }, delay);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, reloadKey]);

  function reload() {
    setReloadKey((current) => current + 1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(food: Food) {
    setEditing(food);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleting) return;

    try {
      setDeleteBusy(true);
      setDeleteError('');
      await deleteFood(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Não foi possível excluir o alimento.'));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6 pb-8">
      <SimpleHeader
        title="Alimentos"
        subtitle="Cadastre, edite e gerencie os alimentos usados nas suas refeições."
        action={
          <button type="button" className="btn btn-primary gap-2" onClick={openCreate}>
            <Plus size={18} weight="bold" />
            <span className="hidden sm:inline">Novo alimento</span>
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <label className="input input-bordered flex items-center gap-2 w-full sm:max-w-md">
          <MagnifyingGlass size={18} className="text-base-content/50" />
          <input
            type="search"
            className="grow"
            placeholder="Buscar alimento..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {!loading && (
          <span className="text-sm text-base-content/60">
            {foods.length} {foods.length === 1 ? 'alimento encontrado' : 'alimentos encontrados'}
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <Warning size={20} />
          <span>{error}</span>
          <button type="button" className="btn btn-sm" onClick={reload}>
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="loading loading-spinner loading-lg text-primary" />
          <span className="text-sm text-base-content/60">Carregando alimentos...</span>
        </div>
      ) : foods.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body items-center text-center py-14">
            <BowlFood size={48} className="text-primary/50" />
            <h2 className="text-xl font-bold mt-2">
              {search.trim() ? 'Nenhum alimento encontrado' : 'Nenhum alimento cadastrado'}
            </h2>
            <p className="text-sm text-base-content/60 max-w-md">
              {search.trim()
                ? 'Tente buscar por outro nome ou cadastre um novo alimento.'
                : 'Cadastre alimentos com seus valores nutricionais por 100 g para montar suas refeições.'}
            </p>
            <button type="button" className="btn btn-primary mt-2 gap-2" onClick={openCreate}>
              <Plus size={18} />
              Cadastrar alimento
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {foods.map((food) => (
            <article key={food.id} className="card bg-base-100 shadow-sm border border-base-300/60">
              <div className="card-body p-5 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="card-title text-lg leading-tight">{food.name}</h2>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square"
                      aria-label={`Editar ${food.name}`}
                      title="Editar"
                      onClick={() => openEdit(food)}
                    >
                      <PencilSimple size={18} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square text-error"
                      aria-label={`Excluir ${food.name}`}
                      title="Excluir"
                      onClick={() => {
                        setDeleting(food);
                        setDeleteError('');
                      }}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-outline font-semibold">
                    {formatNumber(food.caloriesPer100g)} kcal
                  </span>
                  <span className="text-xs text-base-content/50">por 100 g</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="rounded-box bg-base-200 px-2 py-2 text-center">
                    <p className="text-xs text-base-content/50">Carboidratos</p>
                    <p className="font-bold text-sm">{formatNumber(food.carbsPer100g)} g</p>
                  </div>
                  <div className="rounded-box bg-base-200 px-2 py-2 text-center">
                    <p className="text-xs text-base-content/50">Proteínas</p>
                    <p className="font-bold text-sm">{formatNumber(food.proteinPer100g)} g</p>
                  </div>
                  <div className="rounded-box bg-base-200 px-2 py-2 text-center">
                    <p className="text-xs text-base-content/50">Gorduras</p>
                    <p className="font-bold text-sm">{formatNumber(food.fatPer100g)} g</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <FoodFormModal
        open={formOpen}
        food={editing}
        onClose={() => setFormOpen(false)}
        onSaved={reload}
      />

      {deleting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
          <div className="card bg-base-100 w-full max-w-md shadow-2xl">
            <div className="card-body gap-4">
              <div className="flex items-center gap-3 text-error">
                <Warning size={28} weight="fill" />
                <h2 className="card-title">Excluir alimento?</h2>
              </div>
              <p className="text-sm text-base-content/70">
                O alimento <strong>{deleting.name}</strong> será removido permanentemente.
                Alimentos já usados em refeições não podem ser excluídos.
              </p>

              {deleteError && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setDeleting(null)}
                  disabled={deleteBusy}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-error"
                  onClick={handleDelete}
                  disabled={deleteBusy}
                >
                  {deleteBusy && <span className="loading loading-spinner loading-sm" />}
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
