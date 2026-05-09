import { AlertTriangle } from 'lucide-react'

interface AnomalyBannerProps {
  fileCount: number
  threshold?: number
}

export default function AnomalyBanner({ fileCount, threshold = 20 }: AnomalyBannerProps) {
  if (fileCount < threshold) return null

  return (
    <div className="bg-studio-critical-light border border-studio-critical/20 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-studio-critical shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-studio-critical">
          Unusually broad change detected
        </p>
        <p className="text-xs text-studio-text-secondary mt-1">
          This mission has touched <strong>{fileCount} files</strong> so far — significantly more
          than typical. Review the plan to ensure scope has not crept.
        </p>
      </div>
    </div>
  )
}
