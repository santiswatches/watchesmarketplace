import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const CATEGORIES = [
  {
    name: "Motorsport",
    description: "Lightweight and built for performance.",
    image: "/assets/watches/panda_daytona-removebg-preview.png",
    param: "?brand=Rolex",
  },
  {
    name: "Divers",
    description: "Heavy water resistance and unique features.",
    image: "/assets/watches/ap_black_dial-removebg-preview.png",
    param: "?brand=Audemars+Piguet",
  },
  {
    name: "Pilots",
    description: "For those who belong in the skies.",
    image: "/assets/watches/green_dial_datejust_rolex-removebg-preview.png",
    param: "?brand=Rolex",
  },
  {
    name: "Executives",
    description: "Slim and elegant, perfect with a suit.",
    image: "/assets/watches/cartier_santos_white_dial-removebg-preview.png",
    param: "?brand=Cartier",
  },
];

export default function CategoryGrid() {
  return (
    <section className="bg-offwhite py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <p className="font-condensed text-center text-3xl md:text-4xl font-bold uppercase tracking-wide text-warm-black mb-12">
          A Watch for Every Kind of Person
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <Link
                to={createPageUrl("shop") + cat.param}
                className="group bg-[#EDECEA] rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300"
              >
                {/* Watch image area */}
                <div className="w-full h-44 flex items-center justify-center bg-[#EDECEA] p-5">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain group-hover:scale-[1.05] transition-transform duration-500 select-none"
                    style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.12))" }}
                  />
                </div>
                {/* Text */}
                <div className="p-5 bg-white">
                  <p className="font-condensed text-xl font-bold uppercase tracking-wide text-warm-black">
                    {cat.name}
                  </p>
                  <p className="font-sans text-[11px] font-light text-muted-warm mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}