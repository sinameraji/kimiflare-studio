import { Target, ArrowRight } from 'lucide-react'

interface WelcomeScreenProps {
  onStartMission: () => void
}

export default function WelcomeScreen({ onStartMission }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center h-full overflow-y-auto">
      <div className="text-center px-8 max-w-xl">
        <div className="flex items-center justify-center mb-5">
          <img src="/logo.png" alt="KimiFlare" className="w-12 h-12 object-cover rounded-xl" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-primary">
            AI Engineering Dashboard
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-studio-text tracking-tight mb-4">
          Don't review code.
          <br />
          <span className="text-studio-primary">Direct architecture.</span>
        </h1>
        <p className="text-sm text-studio-text-secondary leading-relaxed mb-8 max-w-md mx-auto">
          KimiFlare Studio is how CTOs and staff engineers delegate to AI agents.
          You set the goal, review the plan, assess the risks — the agent handles the rest.
        </p>
        <button
          onClick={onStartMission}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
        >
          <Target className="w-4 h-4" />
          Start a Mission
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
