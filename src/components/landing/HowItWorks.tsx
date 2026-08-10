const STEPS = [
  { n: "01", title: "Submit your dates", desc: "Earliest and latest departure, return if you need one. Two minutes." },
  { n: "02", title: "Get your fare", desc: "An agent checks live availability and calls or messages you the best price." },
  { n: "03", title: "Fly", desc: "Pay in person, get your ticket on your phone, and you're set." },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-2xl font-bold text-foreground mb-10">How it works</h2>
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {STEPS.map((s) => (
          <li key={s.n}>
            <span className="font-mono text-sm text-primary">{s.n}</span>
            <h3 className="font-display text-lg font-bold text-foreground mt-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { HowItWorks }
