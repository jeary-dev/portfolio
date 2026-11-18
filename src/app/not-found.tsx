import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p aria-hidden="true" className="font-jp text-[clamp(6rem,24vw,14rem)] leading-none text-shiro/[0.06]">
          迷
        </p>
        <h1 className="-mt-8 font-display text-5xl font-light text-shiro md:text-6xl">This path hasn&apos;t bloomed.</h1>
        <p className="mt-4 text-mist">The page you&apos;re looking for drifted away.</p>
        <Link
          href="/"
          className="mt-10 inline-flex h-12 items-center rounded-full bg-sakura px-7 text-[14px] font-medium text-ink"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
