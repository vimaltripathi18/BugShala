import Badge from './Badge'
import type { Difficulty } from '@/types'
import { difficultyLabel } from '@/lib/utils'

interface DifficultyBadgeProps {
  difficulty: Difficulty
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const variantMap: Record<Difficulty, 'success' | 'warning' | 'error'> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'error',
  }
  return (
    <Badge variant={variantMap[difficulty] ?? 'muted'}>
      {difficultyLabel(difficulty)}
    </Badge>
  )
}
