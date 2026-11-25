import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
  ChartBar,
  Fire,
  Heartbeat,
  Target,
  Warning,
} from '@phosphor-icons/react';

import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { getMetrics } from '@/services/metricsService';
import { getApiErrorMessage } from '@/lib/api';
import type { MetricsSummary } from '@/types/metrics';
import type { Imc } from '@/types/user';

const IMC_BADGE: Record<Imc['tone'], string> = {
  low: 'badge-info',
  normal: 'badge-success',
  overweight: 'badge-warning',
  obesity: 'badge-error',
};

const IMC_BAR: Record<Imc['tone'], string> = {
  low: 'bg-info',
  normal: 'bg-success',
  overweight: 'bg-warning',
  obesity: 'bg-error',
};

function markerPosition(value: number): number {
  const min = 15;
  const max = 40;
  return Math.min(Math.max(((value - min) / (max - min)) * 100, 1), 99);
}

export function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      setMetrics(await getMetrics());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as métricas.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-3">
        <span className="loading loading-spinner loading-lg text-primary" />
        <span className="text-sm text-base-content/60">Calculando suas métricas...</span>
      </div>
    );
  }

  const imc = metrics?.imc ?? null;
  const week = metrics?.last7Days;
  const maxCalories = Math.max(
    week?.target ?? 0,
    ...(week?.days.map((day) => day.calories) ?? [0]),
    1,
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6 pb-8">
      <SimpleHeader
        title="Métricas"
        subtitle="IMC e média calórica dos últimos sete dias."
        action={
          <Link to="/profile" className="btn btn-ghost btn-sm gap-1">
            Editar perfil
            <ArrowRight size={16} />
          </Link>
        }
      />

      {error && (
        <div role="alert" className="alert alert-error">
          <Warning size={20} />
          <span>{error}</span>
          <button type="button" className="btn btn-sm" onClick={load}>
            Tentar novamente
          </button>
        </div>
      )}

      {!imc && !metrics?.profile.hasProfile && (
        <div className="alert alert-info items-start sm:items-center">
          <Calculator size={24} />
          <div className="flex-1">
            <p className="font-semibold">Faltam dados para calcular suas métricas</p>
            <p className="text-sm opacity-80">
              Cadastre meta calórica, altura e peso no seu perfil. O IMC e a média
              dos últimos 7 dias aparecerão aqui.
            </p>
          </div>
          <Link to="/profile" className="btn btn-sm btn-primary">
            Cadastrar dados
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card bg-base-100 shadow-sm">
          <div className="card-body gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 text-primary p-3">
                  <Heartbeat size={24} weight="fill" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Índice de Massa Corporal</h2>
                  <p className="text-sm text-base-content/60">
                    Peso ÷ altura²
                  </p>
                </div>
              </div>
              {imc && (
                <span className={`badge badge-lg ${IMC_BADGE[imc.tone]}`}>
                  {imc.label}
                </span>
              )}
            </div>

            {imc ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black">
                    {imc.value.toLocaleString('pt-BR', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </span>
                  <span className="text-base-content/60 mb-1 text-sm">kg/m²</span>
                </div>

                <div className="mt-2">
                  <div className="relative h-3 rounded-full overflow-hidden flex">
                    <div className="bg-info/60 flex-[18.5]" />
                    <div className="bg-success/60 flex-[6.5]" />
                    <div className="bg-warning/60 flex-[5]" />
                    <div className="bg-error/60 flex-[10]" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-base-100 shadow"
                      style={{ left: `${markerPosition(imc.value)}%` }}
                    >
                      <span className={`block w-full h-full rounded-full ${IMC_BAR[imc.tone]}`} />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-base-content/50 mt-1">
                    <span>18,5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40+</span>
                  </div>
                </div>

                <p className="text-sm text-base-content/70">{imc.description}</p>

                <div className="flex items-center gap-2 text-xs text-base-content/50">
                  <span>Peso: {metrics?.profile.weight} kg</span>
                  <span>•</span>
                  <span>Altura: {metrics?.profile.height} cm</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-start gap-3 py-4">
                <p className="text-sm text-base-content/70">
                  Informe peso e altura no perfil para calcular seu IMC.
                </p>
                <Link to="/profile" className="btn btn-sm btn-primary">
                  Completar perfil
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 text-primary p-3">
                  <Fire size={24} weight="fill" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Média calórica (7 dias)</h2>
                  <p className="text-sm text-base-content/60">
                    Média diária dos últimos sete dias
                  </p>
                </div>
              </div>
              {week && (
                <span
                  className={`badge badge-lg ${
                    week.status === 'DENTRO'
                      ? 'badge-success'
                      : week.status === 'ACIMA'
                        ? 'badge-error'
                        : week.status === 'ABAIXO'
                          ? 'badge-warning'
                          : 'badge-ghost'
                  }`}
                >
                  {week.statusLabel}
                </span>
              )}
            </div>

            <div className="flex items-end gap-2">
              <span className="text-5xl font-black">
                {(week?.averageCalories ?? 0).toLocaleString('pt-BR')}
              </span>
              <span className="text-base-content/60 mb-1 text-sm">kcal/dia</span>
            </div>

            {week?.target != null ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/60">
                    Meta: {week.target.toLocaleString('pt-BR')} kcal
                  </span>
                  <span
                    className={`font-semibold ${
                      week.status === 'ACIMA'
                        ? 'text-error'
                        : week.status === 'ABAIXO'
                          ? 'text-warning'
                          : 'text-success'
                    }`}
                  >
                    {(week.percentageOfTarget ?? 0).toLocaleString('pt-BR')}% da meta
                  </span>
                </div>
                <progress
                  className={`progress w-full h-3 ${
                    week.status === 'ACIMA'
                      ? 'progress-error'
                      : week.status === 'ABAIXO'
                        ? 'progress-warning'
                        : 'progress-success'
                  }`}
                  value={Math.min(week.percentageOfTarget ?? 0, 100)}
                  max={100}
                />
                <p className="text-sm text-base-content/70">
                  {week.difference === 0
                    ? 'Sua média está exatamente na meta.'
                    : week.difference !== null && week.difference > 0
                      ? `Sua média está ${week.difference.toLocaleString('pt-BR')} kcal acima da meta.`
                      : `Sua média está ${Math.abs(week.difference ?? 0).toLocaleString('pt-BR')} kcal abaixo da meta.`}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 py-1">
                <p className="text-sm text-base-content/70">
                  Cadastre uma meta calórica para comparar sua média diária.
                </p>
                <Link to="/profile" className="btn btn-sm btn-primary gap-1">
                  <Target size={16} />
                  Definir meta
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 text-primary p-2.5">
                <ChartBar size={22} weight="fill" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Calorias por dia</h2>
                <p className="text-sm text-base-content/60">
                  Total consumido nos últimos sete dias
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-base-content/50">Total no período</p>
              <p className="font-bold">{(week?.totalCalories ?? 0).toLocaleString('pt-BR')} kcal</p>
            </div>
          </div>

          <div className="relative h-56 sm:h-64 w-full mt-4">
            {week?.target != null && week.target <= maxCalories && (
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-primary/60 z-10 pointer-events-none"
                style={{ bottom: `${(week.target / maxCalories) * 100}%` }}
              >
                <span className="absolute -top-6 right-0 text-xs font-semibold text-primary bg-base-100 px-1">
                  Meta {week.target.toLocaleString('pt-BR')}
                </span>
              </div>
            )}

            <div className="absolute inset-0 flex items-end gap-2 sm:gap-4">
              {week?.days.map((day) => {
                const height = Math.max((day.calories / maxCalories) * 100, 2);
                const overTarget = week.target !== null && day.calories > week.target;

                return (
                  <div key={day.date} className="flex-1 h-full flex flex-col items-center justify-end gap-1 group">
                    <span className="text-[11px] sm:text-xs font-semibold text-base-content/60 group-hover:text-base-content">
                      {day.calories.toLocaleString('pt-BR')}
                    </span>
                    <div
                      className={`w-full max-w-12 rounded-t-box transition-all ${
                        overTarget
                          ? 'bg-error/70 group-hover:bg-error'
                          : day.isToday
                            ? 'bg-primary'
                            : 'bg-primary/40 group-hover:bg-primary/60'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${day.shortDate}: ${day.calories} kcal`}
                    />
                    <span
                      className={`text-xs ${
                        day.isToday ? 'font-bold text-primary' : 'text-base-content/60'
                      }`}
                    >
                      {day.weekday}
                    </span>
                    <span className="text-[10px] text-base-content/40">{day.shortDate}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/60">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-primary" /> Hoje
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-primary/40" /> Dias anteriores
            </span>
            {week?.target != null && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-error/70" /> Acima da meta
              </span>
            )}
          </div>

          <p className="text-xs text-base-content/50">
            A média considera os 7 dias do período, incluindo dias sem refeições registradas.
          </p>
        </div>
      </section>
    </div>
  );
}
