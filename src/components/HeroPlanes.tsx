/** Professional Vecteezy jet illustration for the hero (plane + clouds, no sky fill). */
export function HeroPlanes({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src="/images/hero-airplane.svg"
      alt=""
      width={920}
      height={500}
      decoding="async"
    />
  );
}
