import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="bg-dusk text-on-dusk">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-display font-bold">Dalmar Travel</div>
          <p className="text-sm text-on-dusk/70 mt-1">Discounted airfare, 10+ years serving the community.</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-on-dusk/70">
          <Link to="/inquiry" className="hover:text-on-dusk transition-colors">Make an inquiry</Link>
          <Link to="/login" className="hover:text-on-dusk transition-colors">Agent login</Link>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
