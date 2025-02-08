// tests/unit/services/ai.spec.js
import { analyzeImage, getPlantCareAdvice } from '@/services/ai';
import axios from 'axios';
import { storage } from '@/utils/firebase';
import { cache } from '@/services/cache';
import { vi } from 'vitest';

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(cache, 'get').mockResolvedValue(null);
    vi.spyOn(cache, 'set').mockResolvedValue();
  });

  describe('analyzeImage', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockImageUrl = 'https://example.com/image.jpg';

    it('successfully analyzes a valid image', async () => {
      const mockAnalysis = { species: 'Rose', health: 'Good' };
      
      vi.spyOn(storage, 'uploadBytes').mockResolvedValue();
      vi.spyOn(storage, 'getDownloadURL').mockResolvedValue(mockImageUrl);
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { url: mockImageUrl } })
                             .mockResolvedValueOnce({ data: mockAnalysis });

      const result = await analyzeImage(mockFile);
      
      expect(result).toEqual({
        imageUrl: mockImageUrl,
        analysis: mockAnalysis
      });
      expect(storage.uploadBytes).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledTimes(2);
    });

    it('handles invalid file types', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      await expect(analyzeImage(invalidFile)).rejects.toThrow('Invalid file type');
    });

    it('handles file size limits', async () => {
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      await expect(analyzeImage(largeFile)).rejects.toThrow('File too large');
    });

    it('uses cached results when available', async () => {
      const mockCachedResult = { analysis: { species: 'Cached Rose' } };
      vi.spyOn(cache, 'get').mockResolvedValue(mockCachedResult);

      const result = await analyzeImage(mockFile);
      
      expect(result).toEqual(mockCachedResult);
      expect(storage.uploadBytes).not.toHaveBeenCalled();
    });
  });

  describe('getPlantCareAdvice', () => {
    it('successfully retrieves plant care advice', async () => {
      const mockAdvice = { watering: 'Weekly', sunlight: 'Full sun' };
      vi.spyOn(axios, 'post').mockResolvedValue({ data: { advice: mockAdvice } });

      const result = await getPlantCareAdvice('rose plant');
      
      expect(result).toEqual(mockAdvice);
      expect(axios.post).toHaveBeenCalledWith('/api/plant-care', { plantInfo: 'rose plant' }, expect.any(Object));
    });

    it('handles empty input', async () => {
      await expect(getPlantCareAdvice('')).rejects.toThrow('No plant information provided');
    });

    it('uses cached advice when available', async () => {
      const mockCachedAdvice = { watering: 'Cached advice' };
      vi.spyOn(cache, 'get').mockResolvedValue(mockCachedAdvice);

      const result = await getPlantCareAdvice('rose plant');
      
      expect(result).toEqual(mockCachedAdvice);
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});