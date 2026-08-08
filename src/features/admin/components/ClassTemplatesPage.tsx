import { useState } from 'react';
import { useClassTemplates } from '@/features/admin/hooks/useClassTemplates';
import { useCreateClassTemplate } from '@/features/admin/hooks/useCreateClassTemplate';
import { useTrainers } from '@/features/trainers/hooks/useTrainers';
import { ClassTemplateForm } from '@/features/admin/components/ClassTemplateForm';
import { ClassTemplateListItem } from '@/features/admin/components/ClassTemplateListItem';
import { Button } from '@/components/Button';

export function ClassTemplatesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: templates, isLoading, error } = useClassTemplates();
  const { data: trainers } = useTrainers();
  const { mutateAsync: createTemplate } = useCreateClassTemplate();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Plantillas de clase</h1>

      {!isCreating && (
        <Button type="button" onClick={() => setIsCreating(true)}>
          Nueva plantilla
        </Button>
      )}

      {isCreating && (
        <div className="rounded-lg border border-line bg-canvas-raised p-4">
          <ClassTemplateForm
            trainers={trainers ?? []}
            submitLabel="Crear plantilla"
            onSubmit={async (values) => {
              await createTemplate(values);
              setIsCreating(false);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            className="mt-2"
            onClick={() => setIsCreating(false)}
          >
            Cancelar
          </Button>
        </div>
      )}

      {isLoading && <p className="text-sm text-ink-faint">Cargando plantillas…</p>}

      {error && (
        <p role="alert" className="text-sm text-danger-500">
          No se han podido cargar las plantillas. Inténtalo de nuevo en unos segundos.
        </p>
      )}

      {templates?.length === 0 && !isCreating && (
        <p className="text-sm text-ink-faint">Todavía no hay plantillas de clase.</p>
      )}

      {templates && templates.length > 0 && (
        <div className="flex flex-col gap-3">
          {templates.map((template) => (
            <ClassTemplateListItem
              key={template.id}
              template={template}
              trainers={trainers ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
