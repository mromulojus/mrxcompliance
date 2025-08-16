import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChartStyle, type ChartConfig } from './chart'

describe('ChartStyle sanitization', () => {
  it('sanitizes config to prevent markup injection', () => {
    const config: ChartConfig = {
      safe: { color: '#fff' },
      'bad;selector': { color: 'blue' },
      evil: { color: 'red;}</style><script>alert(1)</script>' }
    }
    const markup = renderToStaticMarkup(<ChartStyle id="test" config={config} />)
    expect(markup).toContain('--color-safe: #fff')
    expect(markup).not.toContain('bad;selector')
    expect(markup.toLowerCase()).not.toContain('script')
  })
})
