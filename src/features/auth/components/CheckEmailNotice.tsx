type CheckEmailContext = 'registro' | 'recuperacion-contrasena';

interface CheckEmailNoticeProps {
  email: string;
  context: CheckEmailContext;
}

const COPY: Record<CheckEmailContext, { title: string; body: string }> = {
  registro: {
    title: 'Revisa tu correo',
    body: 'Ábrelo para activar tu cuenta — hasta entonces no podrás iniciar sesión.',
  },
  'recuperacion-contrasena': {
    title: 'Revisa tu correo',
    body: 'Ábrelo para elegir una contraseña nueva. El enlace caduca pasado un tiempo, así que hazlo pronto.',
  },
};

// Wrapper compartido para "te hemos enviado un email" — el texto varía
// según el contexto (COPY), pero la estructura visual y el aviso de spam
// son iguales en los dos casos, así que no se duplica el componente.
export function CheckEmailNotice({ email, context }: CheckEmailNoticeProps) {
  const { title, body } = COPY[context];

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-canvas-raised p-6 text-center">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="text-base text-ink-muted">
        Hemos enviado un enlace a <strong className="text-ink">{email}</strong>. {body}
      </p>
      <p className="text-sm text-ink-faint">
        ¿No lo encuentras? Revisa también la carpeta de spam.
      </p>
    </div>
  );
}
