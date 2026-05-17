import React, { useEffect } from "react";
import { ArrowLeft, Target, Users, Globe } from "lucide-react";
import { CustomCursor } from "./components";



type AboutPageProps = {
  onBack: () => void;
};

const infoBlocks = [
  {
    icon: <Target size={32} />,
    title: "Our Mission",
    text: "To merge creativity and engineering into meaningful digital systems with obsessive attention to detail.",
  },
  {
    icon: <Users size={32} />,
    title: "The Community",
    text: "A collective of designers, developers, and thinkers driven by quality and innovation.",
  },
  {
    icon: <Globe size={32} />,
    title: "Global Impact",
    text: "Based in Dubai, delivering world-class digital systems across borders.",
  },
];

const coreValues = [
  { number: "01.", title: "Integrity", text: "Radical honesty in process, communication, and execution." },
  { number: "02.", title: "Precision", text: "Every detail matters. Nothing is accidental." },
  { number: "03.", title: "Innovation", text: "Constantly pushing boundaries in AI, design, and systems." },
];

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white animate-fade-in flex flex-col selection:bg-brand selection:text-black">
      <CustomCursor />

      {/* NAVBAR */}
      <nav className="p-8 md:p-12 flex justify-between items-center bg-black/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <button
          onClick={onBack}
          className="flex items-center gap-4 hover:text-brand transition-all"
          aria-label="Go back to home"
        >
          <ArrowLeft size={32} className="group-hover:-translate-x-2 transition-transform" />
          <span className="font-black italic uppercase text-lg tracking-tighter">Exit</span>
        </button>

       <div className="h-10 md:h-14">
  <img src="assets/DTAIL LOGO.png" alt="DTAIL Logo" className="h-full object-contain" />
</div>

      </nav>

      {/* MAIN */}
      <main className="flex-1 px-6 md:px-24 py-24 max-w-6xl mx-auto w-full">
        {/* HEADER */}
        <header className="mb-24">
          <h1 className="text-6xl md:text-8xl font-display font-black uppercase mb-8 tracking-tighter">
            About Us
          </h1>
          <div className="h-2 w-24 bg-brand" />
        </header>

        {/* STORY + ICON BLOCKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-32 items-start">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.3em] mb-8 text-brand">The Story</h2>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed mb-8 font-light">
              DTAIL is a creative agency built at the intersection of design, technology, and precision. We transform bold ideas into powerful digital experiences.
            </p>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed font-light">
              Every pixel, interaction, and line of code is intentional. We don’t just ship projects — we engineer impact.
            </p>
          </div>

          <div className="space-y-12">
            {infoBlocks.map((block, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="p-4 bg-brand/10 text-brand rounded-full">{block.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold uppercase mb-2">{block.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{block.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CORE VALUES */}
        <section className="bg-white/5 p-12 md:p-20 border border-white/10 mb-32">
          <h2 className="text-3xl font-black uppercase mb-12 tracking-widest text-center">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {coreValues.map((value, i) => (
              <div key={i}>
                <div className="text-brand text-5xl font-black mb-4 italic">{value.number}</div>
                <h4 className="text-xl font-bold uppercase mb-4">{value.title}</h4>
                <p className="text-gray-500">{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BACK BUTTON */}
        <div className="text-center py-12">
          <button
            onClick={onBack}
            className="text-lg font-black uppercase tracking-[0.5em] border-b-2 border-brand pb-2 hover:text-brand transition-all"
          >
            Back to Home
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-900/50 py-12 px-6 md:px-24 border-t border-white/5 flex justify-between text-[10px] font-mono opacity-30 uppercase tracking-[0.5em]">
        <span>© 2025 DTAIL_STUDIO</span>
        <span>SYSTEM_V_3_ABOUT_SIMPLE</span>
      </footer>
    </div>
  );
};

export default AboutPage;
