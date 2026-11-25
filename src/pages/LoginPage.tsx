import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeSlash,
  GithubLogo,
  Leaf,
  SignIn,
  UserPlus,
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL, getApiErrorDetails, getApiErrorMessage } from '@/lib/api';
import { providersRequest } from '@/services/authService';import { ThemeToggle } from '@/components/layout/ThemeToggle';

type Mode = 'login' | 'register';

const GITHUB_ERRORS: Record<string, string> = {
  github_nao_configurado: 'O login com GitHub não está configurado neste ambiente. Use e-mail e senha.',
  github_code_ausente: 'O GitHub não retornou o código de autorização. Tente novamente.',
  github_token: 'Não foi possível validar sua conta do GitHub. Tente novamente.',
  github_falhou: 'Falha ao entrar com GitHub. Tente novamente ou use e-mail e senha.',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, login, register, applyToken } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [tokenProcessing, setTokenProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromGithub = params.get('token');
    const githubError = params.get('error');

    if (githubError) {
      setError(GITHUB_ERRORS[githubError] ?? 'Não foi possível entrar com GitHub.');
    }

    if (tokenFromGithub) {
      setTokenProcessing(true);
      window.history.replaceState({}, '', '/login');

      applyToken(tokenFromGithub)
        .then(() => {
          navigate('/', { replace: true });
        })
        .catch(() => {
          setError('Não foi possível restaurar sua sessão do GitHub.');
          setTokenProcessing(false);
        });
    }

    providersRequest()
      .then((providers) => setGithubEnabled(providers.github))
      .catch(() => setGithubEnabled(false));
  }, [navigate]);

  if (loading || tokenProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
        <span className="text-sm text-base-content/60">Carregando...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setFieldErrors({});
    setPassword('');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    if (mode === 'register' && name.trim().length < 2) {
      setFieldErrors({ name: 'Informe seu nome completo.' });
      return;
    }
    if (!email.trim()) {
      setFieldErrors({ email: 'E-mail é obrigatório.' });
      return;
    }
    if (!password) {
      setFieldErrors({ password: 'Senha é obrigatória.' });
      return;
    }
    if (mode === 'register' && password.length < 8) {
      setFieldErrors({ password: 'A senha deve ter pelo menos 8 caracteres.' });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível entrar. Tente novamente.'));
      setFieldErrors(getApiErrorDetails(err));
    } finally {
      setSubmitting(false);
    }
  }

  function startGithubLogin() {
    window.location.href = `${API_URL}/auth/github`;
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle compact />
      </div>

      <div className="mx-auto min-h-screen max-w-6xl grid lg:grid-cols-[1.05fr_1fr] items-stretch">
        <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary text-primary-content p-10">
          <div className="absolute inset-0 opacity-15 pointer-events-none [background:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_80%,white,transparent_30%)]" />

          <div className="relative z-10 flex items-center gap-3">
            <Leaf size={32} weight="fill" />
            <span className="text-2xl font-extrabold tracking-tight">SiNutre</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8">
            <img
              src="/plate.png"
              alt="Prato com alimentos variados"
              className="w-full max-w-md drop-shadow-xl"
            />
            <div className="text-center max-w-md">
              <h2 className="text-4xl font-extrabold leading-tight">
                Comer bem começa com dados claros.
              </h2>
              <p className="mt-3 text-primary-content/80">
                Registre refeições, acompanhe macronutrientes, defina sua meta
                calórica e veja sua evolução em métricas simples.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3 text-center text-sm">
            {['Alimentos', 'Refeições', 'Métricas'].map((item) => (
              <div key={item} className="rounded-box bg-primary-content/10 py-3 font-medium">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-2 mb-8 text-primary">
              <Leaf size={28} weight="fill" />
              <span className="text-2xl font-extrabold">SiNutre</span>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body gap-5">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    {mode === 'login' ? 'Bem-vindo(a) de volta' : 'Crie sua conta'}
                  </h1>
                  <p className="text-base-content/60 mt-1 text-sm">
                    {mode === 'login'
                      ? 'Entre para acompanhar sua alimentação.'
                      : 'Leva menos de um minuto para começar.'}
                  </p>
                </div>

                <div role="tablist" className="tabs tabs-box bg-base-200 p-1">
                  <button
                    type="button"
                    role="tab"
                    className={`tab flex-1 ${mode === 'login' ? 'tab-active' : ''}`}
                    onClick={() => switchMode('login')}
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`tab flex-1 ${mode === 'register' ? 'tab-active' : ''}`}
                    onClick={() => switchMode('register')}
                  >
                    Criar conta
                  </button>
                </div>

                {error && (
                  <div role="alert" className="alert alert-error text-sm">
                    <span>{error}</span>
                  </div>
                )}

                <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
                  {mode === 'register' && (
                    <label className="form-control w-full">
                      <span className="label-text mb-1 font-medium">Nome</span>
                      <input
                        className={`input input-bordered w-full ${fieldErrors.name ? 'input-error' : ''}`}
                        placeholder="Como podemos chamar você?"
                        value={name}
                        autoComplete="name"
                        onChange={(event) => setName(event.target.value)}
                      />
                      {fieldErrors.name && (
                        <span className="text-error text-xs mt-1">{fieldErrors.name}</span>
                      )}
                    </label>
                  )}

                  <label className="form-control w-full">
                    <span className="label-text mb-1 font-medium">E-mail</span>
                    <input
                      type="email"
                      className={`input input-bordered w-full ${fieldErrors.email ? 'input-error' : ''}`}
                      placeholder="voce@exemplo.com"
                      value={email}
                      autoComplete="email"
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    {fieldErrors.email && (
                      <span className="text-error text-xs mt-1">{fieldErrors.email}</span>
                    )}
                  </label>

                  <label className="form-control w-full">
                    <span className="label-text mb-1 font-medium">Senha</span>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`input input-bordered w-full pr-12 ${fieldErrors.password ? 'input-error' : ''}`}
                        placeholder={mode === 'register' ? 'Mínimo de 8 caracteres' : 'Sua senha'}
                        value={password}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square absolute right-1 top-1"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <span className="text-error text-xs mt-1">{fieldErrors.password}</span>
                    )}
                    {mode === 'register' && !fieldErrors.password && (
                      <span className="text-base-content/50 text-xs mt-1">
                        Use pelo menos uma letra e um número.
                      </span>
                    )}
                  </label>

                  <button
                    type="submit"
                    className="btn btn-primary w-full mt-1"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : mode === 'login' ? (
                      <SignIn size={20} />
                    ) : (
                      <UserPlus size={20} />
                    )}
                    {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  </button>
                </form>

                {githubEnabled && (
                  <>
                    <div className="divider text-xs text-base-content/50 my-0">ou</div>
                    <button
                      type="button"
                      onClick={startGithubLogin}
                      className="btn btn-neutral w-full gap-2"
                    >
                      <GithubLogo size={20} weight="fill" />
                      Entrar com GitHub
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-center text-xs text-base-content/50 mt-6">
              Seus dados ficam vinculados apenas à sua conta.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
