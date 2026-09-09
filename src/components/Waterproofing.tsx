import { useReveal } from '../hooks/useReveal'
import waterproofingImage from "../assets/Waterproofing.png";

const ITEMS = [
  'Rooftop waterproofing',
  'Terrace waterproofing',
  'Basement waterproofing',
  'Water tank waterproofing',
  'Foundation waterproofing',
  'Under-construction waterproofing',
]

export default function Waterproofing() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="relative bg-navy-dark py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-[0.12]" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center relative">
        <div className="reveal corner-ticks p-2 order-2 lg:order-1" ref={ref}>
          <div className="relative overflow-hidden aspect-[4/3]">
            <img
              src={waterproofingImage}
              alt="Waterproofing membrane application on a rooftop"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <span className="eyebrow text-gold text-xs">Specialist Service</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-off mt-4 leading-[1.1] text-balance">
            Protect Your Property From Water Damage.
          </h2>
          <div className="hairline w-24 mt-8 mb-8" />
          <p className="text-off/70 leading-relaxed">
            Water damage compromises structures over time. We assess, treat and seal vulnerable
            areas across the building envelope using proven waterproofing methods.
          </p>

          <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-off/85 text-sm">
                <span className="w-1.5 h-1.5 bg-gold shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-gold text-navy-dark font-semibold text-sm tracking-wide px-8 py-4 mt-10 hover:bg-gold-light transition-colors duration-300"
          >
            Request a Site Assessment
          </a>
        </div>
      </div>
    </section>
  )
}
