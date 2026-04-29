import svgPaths from "./svg-5qcyhuzsca";
import imgShapeLogoSvg1 from "./4a6b3dfa7d2d6f85942306c47f14812fe99ac182.png";

function ShapeLogoSvg() {
  return (
    <div className="h-[30px] overflow-clip relative shrink-0 w-[33px]" data-name="shape logo svg 1">
      <img alt="" className="absolute block inset-0 max-w-none size-full" height="30" src={imgShapeLogoSvg1.src} width="33" />
    </div>
  );
}

function NameLogo() {
  return (
    <div className="h-[24px] relative shrink-0 w-[146px]" data-name="name logo 1">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 146 24">
        <g clipPath="url(#clip0_19_15)" id="name logo 1">
          <path d={svgPaths.p4be4800} fill="var(--fill-0, white)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_19_15">
            <rect fill="white" height="24" width="146" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative size-full">
      <ShapeLogoSvg />
      <NameLogo />
    </div>
  );
}
