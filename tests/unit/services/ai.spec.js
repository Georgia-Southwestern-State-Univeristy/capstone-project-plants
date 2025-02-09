import { analyzeImage, getPlantCareAdvice } from 'server/services/ai'
import axios from 'axios'
import { storage } from 'server/utils/firebase'
import { cache } from 'server/services/cache'
import vision from '@google-cloud/vision'
import { vi } from 'vitest'

describe('AI Service', () => {
  const mockImageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
  const mockVisionClient = {
    annotateImage: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(cache, 'get').mockResolvedValue(null)
    vi.spyOn(cache, 'set').mockResolvedValue()
    vi.spyOn(storage, 'uploadBytes').mockResolvedValue()
    vi.spyOn(storage, 'getDownloadURL').mockResolvedValue('mock-url')
    vi.spyOn(vision, 'ImageAnnotatorClient').mockReturnValue(mockVisionClient)
  })

  describe('analyzeImage', () => {
    it('successfully analyzes plant image', async () => {
      const mockVisionResponse = {
        labelAnnotations: [
          { description: 'Plant', score: 0.9 }
        ],
        imagePropertiesAnnotation: {
          dominantColors: {
            colors: [{ color: { green: 200, red: 100, blue: 100 }, score: 0.5 }]
          }
        },
        localizedObjectAnnotations: []
      }

      mockVisionClient.annotateImage.mockResolvedValue([mockVisionResponse])

      const mockPerenualResponse = {
        data: {
          data: [{
            common_name: 'Test Plant',
            scientific_name: 'Testus Plantus',
            care_instructions: 'Water daily'
          }]
        }
      }

      vi.spyOn(axios, 'get').mockResolvedValue(mockPerenualResponse)

      const result = await analyzeImage(mockImageFile)

      expect(result.analysis.species).toBe('Test Plant')
      expect(result.analysis.health).toBe(true)
      expect(result.naturalResponse).toContain('good health')
      expect(mockVisionClient.annotateImage).toHaveBeenCalled()
      expect(axios.get).toHaveBeenCalled()
    })

    it('handles invalid file types', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      await expect(analyzeImage(invalidFile)).rejects.toThrow('Invalid file type')
    })

    it('uses cached results when available', async () => {
      const mockCachedResult = {
        analysis: { species: 'Cached Plant' },
        naturalResponse: 'Cached response'
      }
      vi.spyOn(cache, 'get').mockResolvedValue(mockCachedResult)

      const result = await analyzeImage(mockImageFile)
      expect(result).toEqual(mockCachedResult)
      expect(mockVisionClient.annotateImage).not.toHaveBeenCalled()
    })
  })

  describe('getPlantCareAdvice', () => {
    it('successfully retrieves care advice', async () => {
      const mockPerenualResponse = {
        data: {
          data: [{
            watering: 'Daily',
            sunlight: 'Full sun',
            soil: 'Well-draining'
          }]
        }
      }

      vi.spyOn(axios, 'get').mockResolvedValue(mockPerenualResponse)

      const result = await getPlantCareAdvice('test plant')
      expect(result.watering).toBe('Daily')
      expect(result.naturalResponse).toContain('Daily')
    })

    it('handles empty input', async () => {
      await expect(getPlantCareAdvice('')).rejects.toThrow('No plant information provided')
    })
  })
})