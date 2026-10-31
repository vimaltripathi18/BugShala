import Badge from './Badge'
import type { VerificationStatus } from '@/types'
import { verificationLabel } from '@/lib/utils'
import { CheckCircle, BookOpen, Users, Clock } from 'lucide-react'

interface VerificationBadgeProps {
  status: VerificationStatus
}

const icons: Record<VerificationStatus, React.ReactNode> = {
  editor_reviewed: <CheckCircle size={10} />,
  documentation_verified: <BookOpen size={10} />,
  community_tested: <Users size={10} />,
  not_reviewed: <Clock size={10} />,
}

const variantMap: Record<VerificationStatus, 'success' | 'info' | 'warning' | 'muted'> = {
  editor_reviewed: 'success',
  documentation_verified: 'info',
  community_tested: 'warning',
  not_reviewed: 'muted',
}

export default function VerificationBadge({ status }: VerificationBadgeProps) {
  return (
    <Badge variant={variantMap[status] ?? 'muted'} className="gap-1">
      {icons[status]}
      {verificationLabel(status)}
    </Badge>
  )
}
