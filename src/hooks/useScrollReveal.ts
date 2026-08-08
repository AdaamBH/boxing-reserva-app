import { useEffect, useRef, useState } from 'react';

// Sin animación si el usuario la ha desactivado, o si el navegador (o el
// entorno de test, jsdom no la implementa) no soporta IntersectionObserver
// — mejor mostrar el contenido de golpe que dejarlo invisible para
// siempre o que la página falle.
function prefersNoAnimation(): boolean {
  return (
    typeof IntersectionObserver === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Revela un elemento (fade + desplazamiento) la primera vez que entra en
// el viewport, en vez de "todo visible desde el principio" — usado por la
// landing page. Solo se dispara una vez por elemento (se desconecta el
// observer tras la primera intersección, no se re-anima al hacer scroll
// arriba y abajo).
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  // Inicializador perezoso: decide el estado de partida sin pasar por un
  // setState síncrono dentro del efecto (evita el render en cascada que
  // marca la regla react-hooks/set-state-in-effect).
  const [isVisible, setIsVisible] = useState(prefersNoAnimation);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersNoAnimation()) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
