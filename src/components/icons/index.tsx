import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </svg>
    )
}

export function USCGEagle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 2.5c-2 0-3.5 1.5-3.5 3.5 0 1.5 1 3 2.5 3.5L12 22l1-12.5c1.5-.5 2.5-2 2.5-3.5C15.5 4 14 2.5 12 2.5z" />
        <path d="M4.5 9.5c-1.5 1-2.5 2.5-2.5 4.5 0 3 2.5 5 5.5 5h9c3 0 5.5-2 5.5-5 0-2-1-3.5-2.5-4.5" />
        <path d="M8 14h8" />
        <path d="M9 17h6" />
    </svg>
  );
}

export function CgMotorLifeBoat(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/icons/cg-motor-life-boat.png"
      alt="CG Motor Life Boat"
      {...props}
    />
  );
}
