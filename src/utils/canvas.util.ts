import { GlobalFonts } from '@napi-rs/canvas'
import { existsSync, mkdirSync } from 'fs'

// Add this at the beginning of your application
export const registerFonts = () => {
  try {
    // Try to register a system font that exists on most Linux distributions
    // You may need to adjust this based on your VPS configuration
    const fontPaths = [
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', // Common on Ubuntu/Debian
      '/usr/share/fonts/TTF/DejaVuSans.ttf', // Common on some Linux distros
      '/usr/share/fonts/liberation/LiberationSans-Regular.ttf', // Another common font
      '/System/Library/Fonts/Helvetica.ttc', // For macOS
      './assets/fonts/Arial.ttf', // Fallback to a bundled font
    ]

    // Try registering each font until one succeeds
    for (const fontPath of fontPaths) {
      if (existsSync(fontPath)) {
        GlobalFonts.registerFromPath(fontPath, 'Default Font')
        console.log(`Registered font from: ${fontPath}`)
        return true
      }
    }

    // If we reach here, no system fonts were found
    console.warn('No system fonts found. Creating bundled font directory.')

    // Create a fonts directory if it doesn't exist
    if (!existsSync('./assets/fonts')) {
      mkdirSync('./assets/fonts', { recursive: true })
      console.log(
        'Font directory created. Please add Arial.ttf to ./assets/fonts/'
      )
    }

    return false
  } catch (error) {
    console.error('Error registering fonts:', error)
    return false
  }
}
