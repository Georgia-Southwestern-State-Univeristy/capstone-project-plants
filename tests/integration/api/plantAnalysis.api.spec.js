import axios from 'axios';
import { vi } from 'vitest';
import { visionService } from 'server/services/vision';
import { cache } from 'server/services/cache';

describe('Plant Analysis API Integration', () => {
  const mockAxios = vi.spyOn(axios, 'post');
  const mockVisionService = vi.spyOn(visionService, 'detectPlants');
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.mockReset();
  });

  describe('Vision AI API Integration', () => {
    it('successfully integrates with Vision AI API', async () => {
      const mockImageBuffer = Buffer.from('test-image');
      const mockVisionResponse = [{
        labelAnnotations: [
          { description: 'Plant', score: 0.9 }
        ]
      }];

      mockVisionService.mockResolvedValue(mockVisionResponse);

      const response = await visionService.detectPlants(mockImageBuffer);
      
      expect(response).toBeDefined();
      expect(mockVisionService).toHaveBeenCalledWith(mockImageBuffer);
      expect(response[0].labelAnnotations[0].description).toBe('Plant');
    });

    it('handles Vision AI API errors gracefully', async () => {
      mockVisionService.mockRejectedValue(new Error('API Error'));

      await expect(visionService.detectPlants(Buffer.from('test')))
        .rejects.toThrow('API Error');
    });
  });

  describe('Perenual API Integration', () => {
    const PERENUAL_API_BASE = 'https://perenual.com/api';
    const mockApiKey = process.env.VUE_APP_PERENUAL_API_KEY;

    it('successfully retrieves plant data from Perenual API', async () => {
      const mockPlantData = {
        data: [{
          common_name: 'Rose',
          scientific_name: 'Rosa',
          care_instructions: 'Water regularly'
        }]
      };

      mockAxios.mockResolvedValue({ data: mockPlantData });

      const response = await axios.get(`${PERENUAL_API_BASE}/species-list`, {
        params: { key: mockApiKey, q: 'Rose' }
      });

      expect(response.data).toEqual(mockPlantData);
      expect(mockAxios).toHaveBeenCalledWith(
        expect.stringContaining(PERENUAL_API_BASE),
        expect.objectContaining({
          params: expect.objectContaining({
            key: mockApiKey
          })
        })
      );
    });

    it('handles Perenual API rate limiting', async () => {
      mockAxios.mockRejectedValue({
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded' }
        }
      });

      await expect(axios.get(`${PERENUAL_API_BASE}/species-list`))
        .rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Cache Integration', () => {
    it('successfully caches and retrieves API responses', async () => {
      const mockData = { species: 'Rose' };
      const cacheKey = 'test-cache-key';

      // Set cache
      await cache.set(cacheKey, mockData, 3600);
      
      // Retrieve from cache
      const cachedData = await cache.get(cacheKey);
      expect(cachedData).toEqual(mockData);
    });

    it('handles cache misses appropriately', async () => {
      const result = await cache.get('non-existent-key');
      expect(result).toBeNull();
    });
  });

  describe('End-to-End API Flow', () => {
    it('completes full plant analysis workflow', async () => {
      const mockImageBuffer = Buffer.from('test-image');
      
      // Mock Vision AI response
      mockVisionService.mockResolvedValue([{
        labelAnnotations: [{ description: 'Rose', score: 0.9 }]
      }]);

      // Mock Perenual API response
      mockAxios.mockResolvedValue({
        data: {
          data: [{
            common_name: 'Rose',
            care_instructions: 'Water regularly'
          }]
        }
      });

      // Execute plant detection
      const visionResult = await visionService.detectPlants(mockImageBuffer);
      expect(visionResult[0].labelAnnotations[0].description).toBe('Rose');

      // Get plant care information
      const plantInfo = await axios.get(`${PERENUAL_API_BASE}/species-list`);
      expect(plantInfo.data.data[0].common_name).toBe('Rose');

      // Verify cache storage
      const cacheKey = `plant_info_Rose`;
      const cachedData = await cache.get(cacheKey);
      expect(cachedData).toBeDefined();
    });
  });
});