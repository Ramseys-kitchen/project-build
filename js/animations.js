// Respect users who have asked their device to reduce motion
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function animateHero() {
  if (reduceMotion) return;

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".hero .tag", { y: 20, opacity: 0, duration: 0.5 })
    .from(".hero h1", { y: 40, opacity: 0, duration: 0.8 }, "-=0.2")
    .from(".hero-actions .btn", { y: 20, opacity: 0, duration: 0.5, stagger: 0.15 }, "-=0.4")
    .from(".hero-image img", { x: 80, opacity: 0, scale: 1.1, duration: 1 }, 0.2);

  return tl;
}

export function animateNewsCards() {
  if (reduceMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".news-card", {
    y: 60,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".news-grid",
      start: "top 85%"
    }
  });
}

export function animatePitch() {
  if (reduceMotion) return;

  const tl = gsap.timeline({ defaults: { ease: "back.out(1.4)" } });

  tl.from(".pitch", { opacity: 0, scale: 0.96, duration: 0.6, ease: "power2.out" })
    .from(".line-5 .player", { y: 60, opacity: 0, duration: 0.5 })
    .from(".line-4 .player", { y: 60, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.2")
    .from(".line-3 .player", { y: 60, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.2")
    .from(".line-2 .player", { y: 60, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.2")
    .from(".line-1 .player", { y: 60, opacity: 0, duration: 0.5 }, "-=0.2");

  return tl;
}

export function makePlayersDraggable() {
  gsap.registerPlugin(Draggable);

  Draggable.create(".player", {
    type: "x,y",
    bounds: ".pitch",
    cursor: "grab",
    activeCursor: "grabbing",
    onPress: function () {
      gsap.to(this.target, { scale: 1.15, duration: 0.2 });
    },
    onRelease: function () {
      gsap.to(this.target, { scale: 1, duration: 0.2 });
    }
  });
}