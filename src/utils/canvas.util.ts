import { existsSync, mkdirSync } from 'fs'
// Import necessary modules
import { GlobalFonts } from '@napi-rs/canvas'
import * as fs from 'fs'
import * as https from 'https'
import { join } from 'path'

// Function to download and install a font
export const setupFont = async () => {
  const fontDir = join(process.cwd(), 'assets', 'fonts')
  const fontPath = join(fontDir, 'OpenSans-Regular.ttf')

  // Create directory if it doesn't exist
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true })
  }

  // Check if font already exists
  if (!fs.existsSync(fontPath)) {
    console.log('Downloading font...')

    // Download a free font from Google Fonts
    const fontUrl =
      'https://fonts.gstatic.com/s/opensans/v34/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.ttf'

    await new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(fontPath)
      https
        .get(fontUrl, (response) => {
          response.pipe(file)
          file.on('finish', () => {
            file.close()
            console.log('Font downloaded successfully')
            resolve()
          })
        })
        .on('error', (err) => {
          fs.unlinkSync(fontPath) // Remove partial file
          reject(err)
        })
    })
  }

  // Register the font
  try {
    GlobalFonts.registerFromPath(fontPath, 'OpenSans')
    console.log('font families', GlobalFonts.families)
    return true
  } catch (error) {
    console.error('Error registering font:', error)
    return false
  }
}

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
