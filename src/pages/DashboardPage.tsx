import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Fire,
  Target,
  TrendUp,
  Warning,
} from '@phosphor-icons/react';

import { AddMealCard } from '@/components/cards/AddMealCard';
import { TotalMealsCard } from '@/components/cards/TotalMealsCard';
import { Header } from '@/components/layout/Header';
import { MacroStatsBar } from '@/components/macros/MacroStatsBar';
import { MealFab } from '@/components/meals/MealFab';
import { MealsList } from '@/components/meals/MealsList';
import { MealsTable } from '@/components/meals/MealsTable';
import { AddMealModal } from '@/components/modal/AddMealModal';
import { useAuth } from '@/contexts/AuthContext';
import { api, getApiErrorMessage } from '@/lib/api';
import { getDashboard } from '@/services/metricsService';
import type { DashboardData } from '@/types/metrics';
import type { Meal } from '@/types/mealSummary';
import { useMealModal } from '@/hooks/useMealModal';

const DRAWER_ID = 'main-drawer';

export function DashboardPage() {
  const { profile } = useAuth();
  const modal = useMealModal();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setError('');
      const [mealsResponse, dashboardResponse] = await Promise.all([
        api.get<Meal[]>('/meals'),
        getDashboard(),
      ]);
      setMeals(mealsResponse.data);
      setDashboard(dashboardResponse);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar o dashboard.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const mealsSummary = useMemo(
    () => ({
      total: dashboard?.meals.total ?? 0,
      today: dashboard?.meals.today ?? 0,
      thisMonth: meals.filter((meal) => {
        const date = new Date(meal.eatTime);
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }).length,
    }),
    [meals, dashboard],
  );

  const macroSummary = useMemo(
    () => ({
      carbs: dashboard?.consumed.carbs ?? 0,
      proteins: dashboard?.consumed.proteins ?? 0,
      fats: dashboard?.consumed.fats ?? 0,
      calories: dashboard?.consumed.calories ?? 0,
      caloriesGoal: dashboard?.targetDietDaily ?? undefined,
    }),
    [dashboard],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-3">
        <span className="loading loading-spinner loading-lg text-primary" />
        <span className="text-sm text-base-content/60">Carregando seu dia...</span>
      </div>
    );
  }

  const target = dashboard?.targetDietDaily ?? null;
  const consumed = dashboard?.consumed.calories ?? 0;
  const percentage = dashboard?.consumedPercentage ?? 0;
  const exceededBy = target !== null ? Math.max(consumed - target, 0) : 0;

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto mb-8">
        <Header drawerId={DRAWER_ID} />

        {error && (
          <div role="alert" className="alert alert-error">
            <Warning size={20} />
            <span>{error}</span>
            <button type="button" className="btn btn-sm" onClick={loadData}>
              Tentar novamente
            </button>
          </div>
        )}

        {!profile?.hasProfile && (
          <div className="alert alert-info items-start sm:items-center">
            <Target size={24} />
            <div className="flex-1">
              <p className="font-semibold">Complete seu perfil para desbloquear as métricas</p>
              <p className="text-sm opacity-80">
                Informe meta calórica, altura e peso para acompanhar IMC e média de calorias.
              </p>
            </div>
            <Link to="/profile" className="btn btn-sm btn-primary">
              Completar perfil
            </Link>
          </div>
        )}

        {dashboard?.exceeded && (
          <div role="alert" className="alert alert-error">
            <Warning size={22} weight="fill" />
            <div>
              <p className="font-bold">Meta calórica diária ultrapassada!</p>
              <p className="text-sm">
                Você consumiu {consumed.toLocaleString('pt-BR')} kcal, {exceededBy.toLocaleString('pt-BR')} kcal acima da meta de {target?.toLocaleString('pt-BR')} kcal.
              </p>
            </div>
          </div>
        )}

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 text-primary p-3">
                  <Target size={24} weight="fill" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Meta calórica diária</h2>
                  <p className="text-sm text-base-content/60">
                    {target !== null
                      ? `Definida no seu perfil: ${target.toLocaleString('pt-BR')} kcal`
                      : 'Nenhuma meta cadastrada ainda'}
                  </p>
                </div>
              </div>

              <Link to="/profile" className="btn btn-sm btn-ghost gap-1">
                Ajustar meta
                <ArrowRight size={16} />
              </Link>
            </div>

            {target !== null ? (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl lg:text-4xl font-black flex items-center gap-2">
                      <Fire size={30} className="text-primary" weight="fill" />
                      {consumed.toLocaleString('pt-BR')}
                      <span className="text-base font-medium text-base-content/60">
                        / {target.toLocaleString('pt-BR')} kcal
                      </span>
                    </p>
                    <p className="text-sm text-base-content/60 mt-1">
                      {dashboard?.exceeded
                        ? `${exceededBy.toLocaleString('pt-BR')} kcal acima da meta`
                        : `${(dashboard?.remainingCalories ?? 0).toLocaleString('pt-BR')} kcal disponíveis`}
                    </p>
                  </div>
                  <span
                    className={`badge badge-lg ${
                      dashboard?.exceeded ? 'badge-error' : 'badge-success'
                    }`}
                  >
                    {percentage.toLocaleString('pt-BR')}% da meta
                  </span>
                </div>

                <progress
                  className={`progress w-full h-4 ${
                    dashboard?.exceeded ? 'progress-error' : 'progress-success'
                  }`}
                  value={Math.min(percentage, 100)}
                  max={100}
                />
              </>
            ) : (
              <Link
                to="/profile"
                className="flex items-center justify-between rounded-box border border-dashed border-base-300 p-4 hover:bg-base-200 transition-colors"
              >
                <span className="text-sm">
                  Cadastre sua meta para ver o progresso do dia e receber alertas.
                </span>
                <TrendUp size={20} className="text-primary" />
              </Link>
            )}
          </div>
        </section>

        <MacroStatsBar summary={macroSummary} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-stretch">
          <TotalMealsCard summary={mealsSummary} />
          <AddMealCard onSelectCategory={modal.openWith} />
        </div>

        {meals.length === 0 ? (
          <section className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center py-12">
              <Fire size={40} className="text-primary/60" />
              <h3 className="font-bold text-lg mt-2">Nenhuma refeição registrada</h3>
              <p className="text-sm text-base-content/60 max-w-md">
                Adicione sua primeira refeição para começar a acompanhar calorias e macronutrientes.
              </p>
            </div>
          </section>
        ) : (
          <>
            <MealsTable meals={meals} />
            <MealsList meals={meals} />
          </>
        )}
      </div>

      <MealFab onSelectCategory={modal.openWith} />

      <AddMealModal
        open={modal.open}
        typeMeal={modal.selectedCategory}
        onClose={modal.close}
        onSave={modal.close}
        onMealCreated={loadData}
      />
    </>
  );
}
