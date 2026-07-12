export interface HighlightMoment {
  time: string
  label: string
  focusNpcId: string
}

export const highlightMoments: HighlightMoment[] = [
  { time: '09:30', label: '木匠铺·小满偶遇', focusNpcId: 'xiaoman' },
  { time: '12:30', label: '陈伯视力考验', focusNpcId: 'chenbo' },
  { time: '19:00', label: '酒馆·守夜人碰面', focusNpcId: 'shitou' },
]
