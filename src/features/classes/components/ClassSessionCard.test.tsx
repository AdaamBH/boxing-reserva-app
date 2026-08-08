import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClassSessionCard } from './ClassSessionCard';
import type { ClassSessionWithTrainer } from '@/features/classes/types';

describe('ClassSessionCard', () => {
  it('muestra un texto de fallback cuando no hay entrenador disponible', () => {
    const session: ClassSessionWithTrainer = {
      id: '1',
      nombre: 'Boxeo',
      nivel: 'intermedio',
      fecha: '2026-07-23',
      hora_inicio: '18:00',
      hora_fin: '19:00',
      aforo_maximo: 20,
      trainer: null,
      estado: 'programada',
      created_at: '2026-07-23T00:00:00.000Z',
      template_id: null,
      trainer_id: 'trainer-1',
    };

    render(<ClassSessionCard session={session} />);

    expect(screen.getByText('Con entrenador por asignar')).toBeInTheDocument();
  });
});
