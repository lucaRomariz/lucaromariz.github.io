// =============================
// Seletores base
// =============================
const avatar = document.querySelector('.avatar');
const sobreSection = document.querySelector('#sobre');
const menuLinks = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('main > section');

// =============================
// Segurança + performance
// - Links externos com rel="noopener"
// - Lazy loading para todas imagens
// =============================
document.querySelectorAll('a[target="_blank"]').forEach(a => {
  if (!a.rel.includes('noopener')) a.rel += (a.rel ? ' ' : '') + 'noopener';
});
document.querySelectorAll('img').forEach(img => {
  img.loading = img.loading || 'lazy';
});

// =============================
// CONTROLE DO AVATAR NO SIDEBAR
// - some quando a seção "sobre" está visível
// =============================
if (avatar && sobreSection) {
  const avatarObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          avatar.style.opacity = '0';         // some no Sobre
          avatar.style.transform = 'scale(0.98)';
        } else {
          avatar.style.opacity = '1';         // aparece fora do Sobre
          avatar.style.transform = 'scale(1)';
        }
      });
    },
    { threshold: 0.6, rootMargin: '0px 0px -10% 0px' }
  );
  avatarObserver.observe(sobreSection);
}

// =============================
// MENU ATIVO (feedback imediato ao clique)
// =============================
// =============================
// MENU ATIVO (feedback imediato ao clique + Lock no ScrollSpy)
// =============================
let isClicking = false; // "Trava" para impedir conflito com o scroll spy

menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    isClicking = true; // Ativa a trava

    menuLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Libera a trava depois que a animação de scroll terminar (aprox 1s de margem)
    setTimeout(() => {
      isClicking = false;
    }, 1000);
  });
});

// =============================
// MENU ATIVO POR SCROLL (ScrollSpy)
// =============================
const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      // Se o usuário clicou, não deixamos o scroll mudar o ativo
      if (isClicking) return;

      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        // Remove active de todos
        menuLinks.forEach(link => link.classList.remove('active'));

        // Ativa o correspondente
        const activeLink = document.querySelector(`.menu-item[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  }
);
sections.forEach(section => sectionObserver.observe(section));

// =============================
// Robustece estado ativo ao trocar de hash manualmente
// =============================
window.addEventListener('hashchange', () => {
  const current = document.querySelector(`.menu-item[href="${location.hash}"]`);
  if (current) {
    menuLinks.forEach(l => l.classList.remove('active'));
    current.classList.add('active');
  }
});

// =============================
// Acessibilidade: navegar pelo menu via teclado
// - setas ↑ / ↓ percorrem itens
// =============================
const menuArray = Array.from(menuLinks);
document.addEventListener('keydown', (e) => {
  if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;
  const activeIndex = menuArray.findIndex(l => l.classList.contains('active'));
  const index = activeIndex >= 0 ? activeIndex : 0;
  e.preventDefault();
  let nextIndex = index + (e.key === 'ArrowDown' ? 1 : -1);
  if (nextIndex < 0) nextIndex = menuArray.length - 1;
  if (nextIndex >= menuArray.length) nextIndex = 0;
  menuArray[nextIndex].focus();
});

// =============================
// Respeito a reduced motion
// =============================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  document.documentElement.style.scrollBehavior = 'auto';
}

// =============================
// TABS ACESSÍVEIS (Sobre)
// =============================
(function initTabs() {
  const tabsContainers = document.querySelectorAll('[data-tabs]');
  tabsContainers.forEach(container => {
    const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
    const panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

    function activateTab(tab) {
      tabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      panels.forEach(p => p.hidden = true);

      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
      const panelId = tab.getAttribute('aria-controls');
      const panel = container.querySelector(`#${panelId}`);
      if (panel) panel.hidden = false;
      tab.focus();
    }

    // Clique
    tabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab)));

    // Teclado (setas, Home, End, Enter/Space)
    container.addEventListener('keydown', (e) => {
      const currentIndex = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        let nextIndex = currentIndex + (e.key === 'ArrowRight' ? 1 : -1);
        if (nextIndex < 0) nextIndex = tabs.length - 1;
        if (nextIndex >= tabs.length) nextIndex = 0;
        activateTab(tabs[nextIndex]);
      }
      if (e.key === 'Home') { e.preventDefault(); activateTab(tabs[0]); }
      if (e.key === 'End') { e.preventDefault(); activateTab(tabs[tabs.length - 1]); }

      if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement;
        if (focused && focused.getAttribute('role') === 'tab') {
          e.preventDefault();
          activateTab(focused);
        }
      }
    });

    // Inicialização
    const initial = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    activateTab(initial);
  });
})();


