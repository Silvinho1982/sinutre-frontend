import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  FloppyDisk,
  Heartbeat,
  SignOut,
  Target,
  UserCircle,
  Warning,
} from '@phosphor-icons/react';

import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorDetails, getApiErrorMessage } from '@/lib/api';
import { saveProfile } from '@/services/profileService';
import { LEVEL_ACTIVITY_OPTIONS } from '@/types/user';

interface FormState {
  targetDietDaily: string;
  height: string;
  weight: string;
  levelActivity: string;
}

const EMPTY_FORM: FormState = {
  targetDietDaily: '',
  height: '',
  weight: '',
  levelActivity: '',
};

function previewImc(weight: number, height: number) {
  if (!weight || !height) return null;
  const value = weight / ((height / 100) * (height / 100));
  if (!Number.isFinite(value)) return null;

  const rounded = Math.round(value * 10) / 10;
  if (rounded < 18.5) return { value: rounded, label: 'Abaixo do peso', tone: 'text-info' };
  if (rounded < 25) return { value: rounded, label: 'Peso normal', tone: 'text-success' };
  if (rounded < 30) return { value: rounded, label: 'Sobrepeso', tone: 'text-warning' };
  return { value: rounded, label: 'Obesidade', tone: 'text-error' };
}

export function ProfilePage() {
  const { user, profile, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setForm({
      targetDietDaily: profile.targetDietDaily?.toString() ?? '',
      height: profile.height?.toString() ?? '',
      weight: profile.weight?.toString() ?? '',
      levelActivity: profile.levelActivity ?? '',
    });
  }, [profile]);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess('');
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    const target = Number(form.targetDietDaily.replace(',', '.'));
    if (form.targetDietDaily.trim() === '') {
      next.targetDietDaily = 'Meta calórica é obrigatória.';
    } else if (!Number.isInteger(target)) {
      next.targetDietDaily = 'A meta deve ser um número inteiro.';
    } else if (target < 500 || target > 20000) {
      next.targetDietDaily = 'A meta deve estar entre 500 e 20.000 kcal.';
    }

    const height = Number(form.height.replace(',', '.'));
    if (form.height.trim() === '') {
      next.height = 'Altura é obrigatória.';
    } else if (!Number.isFinite(height) || height < 80 || height > 250) {
      next.height = 'Informe a altura entre 80 e 250 cm.';
    }

    const weight = Number(form.weight.replace(',', '.'));
    if (form.weight.trim() === '') {
      next.weight = 'Peso é obrigatório.';
    } else if (!Number.isFinite(weight) || weight < 20 || weight > 400) {
      next.weight = 'Informe o peso entre 20 e 400 kg.';
    }

    if (!form.levelActivity) {
      next.levelActivity = 'Selecione um nível de atividade.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    try {
      setSaving(true);
      await saveProfile({
        targetDietDaily: Number(form.targetDietDaily.replace(',', '.')),
        height: Number(form.height.replace(',', '.')),
        weight: Number(form.weight.replace(',', '.')),
        levelActivity: form.levelActivity as (typeof LEVEL_ACTIVITY_OPTIONS)[number]['value'],
      });
      await refreshUser();
      setSuccess('Dados atualizados com sucesso!');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível salvar seus dados.'));
      setErrors(getApiErrorDetails(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const imc = previewImc(
    Number(form.weight.replace(',', '.')),
    Number(form.height.replace(',', '.')),
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6 pb-8">
      <SimpleHeader
        title="Perfil"
        subtitle="Seus dados complementares alimentam o dashboard e as métricas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        <section className="card bg-base-100 shadow-sm">
          <form className="card-body gap-5" onSubmit={handleSubmit} noValidate>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 text-primary p-3">
                <Target size={24} weight="fill" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Dados complementares</h2>
                <p className="text-sm text-base-content/60">
                  Usados para calcular meta, IMC e comparação calórica.
                </p>
              </div>
            </div>

            {error && (
              <div role="alert" className="alert alert-error text-sm">
                <Warning size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div role="alert" className="alert alert-success text-sm">
                <CheckCircle size={18} weight="fill" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="form-control w-full sm:col-span-2">
                <span className="label-text mb-1 font-medium">
                  Meta calórica diária (kcal)
                </span>
                <input
                  type="number"
                  min={500}
                  max={20000}
                  step={1}
                  className={`input input-bordered w-full ${errors.targetDietDaily ? 'input-error' : ''}`}
                  placeholder="Ex.: 2000"
                  value={form.targetDietDaily}
                  onChange={(event) => update('targetDietDaily', event.target.value)}
                />
                {errors.targetDietDaily ? (
                  <span className="text-error text-xs mt-1">{errors.targetDietDaily}</span>
                ) : (
                  <span className="text-base-content/40 text-xs mt-1">Entre 500 e 20.000 kcal</span>
                )}
              </label>

              <label className="form-control w-full">
                <span className="label-text mb-1 font-medium">Altura (cm)</span>
                <input
                  type="number"
                  min={80}
                  max={250}
                  step="0.1"
                  className={`input input-bordered w-full ${errors.height ? 'input-error' : ''}`}
                  placeholder="Ex.: 170"
                  value={form.height}
                  onChange={(event) => update('height', event.target.value)}
                />
                {errors.height ? (
                  <span className="text-error text-xs mt-1">{errors.height}</span>
                ) : (
                  <span className="text-base-content/40 text-xs mt-1">Entre 80 e 250 cm</span>
                )}
              </label>

              <label className="form-control w-full">
                <span className="label-text mb-1 font-medium">Peso (kg)</span>
                <input
                  type="number"
                  min={20}
                  max={400}
                  step="0.1"
                  className={`input input-bordered w-full ${errors.weight ? 'input-error' : ''}`}
                  placeholder="Ex.: 68"
                  value={form.weight}
                  onChange={(event) => update('weight', event.target.value)}
                />
                {errors.weight ? (
                  <span className="text-error text-xs mt-1">{errors.weight}</span>
                ) : (
                  <span className="text-base-content/40 text-xs mt-1">Entre 20 e 400 kg</span>
                )}
              </label>

              <label className="form-control w-full sm:col-span-2">
                <span className="label-text mb-1 font-medium">Nível de atividade física</span>
                <select
                  className={`select select-bordered w-full ${errors.levelActivity ? 'select-error' : ''}`}
                  value={form.levelActivity}
                  onChange={(event) => update('levelActivity', event.target.value)}
                >
                  <option value="">Selecione...</option>
                  {LEVEL_ACTIVITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.levelActivity && (
                  <span className="text-error text-xs mt-1">{errors.levelActivity}</span>
                )}
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="btn btn-primary gap-2" disabled={saving}>
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <FloppyDisk size={18} />
                )}
                {profile?.hasProfile ? 'Salvar alterações' : 'Cadastrar dados'}
              </button>
            </div>
          </form>
        </section>

        <div className="flex flex-col gap-6">
          <section className="card bg-base-100 shadow-sm">
            <div className="card-body gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Heartbeat size={22} weight="fill" />
                <h2 className="font-bold">Prévia do IMC</h2>
              </div>

              {imc ? (
                <>
                  <p className="text-4xl font-black">
                    {imc.value.toLocaleString('pt-BR', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </p>
                  <p className={`font-semibold ${imc.tone}`}>{imc.label}</p>
                  <p className="text-xs text-base-content/50">
                    Cálculo estimado com os valores preenchidos. O resultado oficial
                    aparece após salvar.
                  </p>
                </>
              ) : (
                <p className="text-sm text-base-content/60">
                  Preencha altura e peso para ver a prévia.
                </p>
              )}
            </div>
          </section>

          <section className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4">
              <div className="flex items-center gap-2">
                <UserCircle size={22} className="text-primary" />
                <h2 className="font-bold">Conta</h2>
              </div>

              <div className="text-sm flex flex-col gap-1">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-base-content/60">
                  {user?.email ?? (user?.githubLogin ? `@${user.githubLogin}` : '—')}
                </p>
                {user?.createdAt && (
                  <p className="text-xs text-base-content/40">
                    Conta criada em{' '}
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              {profile?.levelActivityLabel && (
                <div className="rounded-box bg-base-200 px-3 py-2 text-sm">
                  <span className="text-base-content/60">Atividade: </span>
                  <span className="font-medium">{profile.levelActivityLabel}</span>
                </div>
              )}

              <button
                type="button"
                className="btn btn-outline btn-error btn-sm justify-start gap-2"
                onClick={handleLogout}
              >
                <SignOut size={16} />
                Sair da conta
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
