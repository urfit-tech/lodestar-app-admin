type ShadeConfig = {
  intensity: number
  type: 'lighten' | 'darken'
}

type PaletteGeneratorInput =
  | string
  | string[]
  | {
      colors?: Array<string | Record<string, string>>
      colorNames?: string[]
      shades?: Record<string, ShadeConfig>
    }

const defaultShades: Record<string, ShadeConfig> = {
  50: { intensity: 0.95, type: 'lighten' },
  100: { intensity: 0.9, type: 'lighten' },
  200: { intensity: 0.75, type: 'lighten' },
  300: { intensity: 0.6, type: 'lighten' },
  400: { intensity: 0.3, type: 'lighten' },
  500: { intensity: 0, type: 'lighten' },
  600: { intensity: 0.1, type: 'darken' },
  700: { intensity: 0.25, type: 'darken' },
  800: { intensity: 0.4, type: 'darken' },
  900: { intensity: 0.51, type: 'darken' },
}

const lighten = (hex: string, intensity: number) => {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    Math.round(r + (255 - r) * intensity),
    Math.round(g + (255 - g) * intensity),
    Math.round(b + (255 - b) * intensity),
  )
}

const darken = (hex: string, intensity: number) => {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(Math.round(r * (1 - intensity)), Math.round(g * (1 - intensity)), Math.round(b * (1 - intensity)))
}

const hexToRgb = (value: string) => {
  const [r, g, b] = value
    .replace('#', '')
    .match(/.{1,2}/g)!
    .map(token => parseInt(token, 16))

  return { r, g, b }
}

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (value: number) => `0${value.toString(16)}`.slice(-2).toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const normalizeHex = (hex: string) => {
  if (!/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(hex)) {
    return null
  }

  return hex.startsWith('#') ? hex : `#${hex}`
}

const tailwindPaletteGenerator = (input: PaletteGeneratorInput) => {
  const params = {
    colors: [] as Array<string | Record<string, string>>,
    colorNames: [
      'primary',
      'secondary',
      'tertiary',
      'quaternary',
      'quinary',
      'senary',
      'septenary',
      'octonary',
      'nonary',
      'denary',
    ],
    shades: defaultShades,
  }

  if (typeof input === 'string') {
    params.colors.push(input)
  } else if (Array.isArray(input)) {
    params.colors = input
  } else if (input && typeof input === 'object') {
    Object.assign(params, input)
  }

  return params.colors.reduce<Record<string, Record<string, string>>>((palette, color) => {
    let name = ''
    let hex = ''

    if (typeof color === 'string') {
      hex = color
    } else if (Array.isArray(color)) {
      name = color[0] || ''
      hex = color[1] || ''
    } else if (color && typeof color === 'object') {
      const entries = Object.entries(color)
      if (entries.length === 1) {
        ;[[name, hex]] = entries
      }
    }

    const normalizedHex = normalizeHex(hex)
    if (!normalizedHex) {
      return palette
    }

    const paletteName = name || params.colorNames.shift() || `color-${Object.keys(palette).length + 1}`
    palette[paletteName] = Object.entries(params.shades).reduce<Record<string, string>>((shades, [shade, config]) => {
      shades[shade] =
        config.type === 'lighten' ? lighten(normalizedHex, config.intensity) : darken(normalizedHex, config.intensity)
      return shades
    }, {})

    return palette
  }, {})
}

export default tailwindPaletteGenerator
