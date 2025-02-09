import { db } from 'server/utils/firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { vi } from 'vitest';
import { analyzeImage, getPlantCareAdvice } from 'server/services/ai';
import { cache } from 'server/services/cache';
import vision from '@google-cloud/vision';

describe('Plant Analysis Integration', () => {
  const mockVisionClient = {
    annotateImage: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(vision, 'ImageAnnotatorClient').mockReturnValue(mockVisionClient);
  });

  it('successfully completes full analysis flow', async () => {
    // Mock Vision AI response
    const mockVisionResponse = {
      labelAnnotations: [{ description: 'Rose', score: 0.95 }],
      imagePropertiesAnnotation: {
        dominantColors: {
          colors: [{ color: { green: 200, red: 100, blue: 100 }, score: 0.5 }]
        }
      },
      localizedObjectAnnotations: []
    };
    mockVisionClient.annotateImage.mockResolvedValue([mockVisionResponse]);

    // Create test image
    const testImage = new File(['test'], 'rose.jpg', { type: 'image/jpeg' });
    
    // Perform analysis
    const analysis = await analyzeImage(testImage);
    
    // Verify analysis results are saved to Firestore
    const docRef = await addDoc(collection(db, 'analyses'), {
      userId: 'test-user',
      analysis,
      timestamp: new Date()
    });
    
    const savedAnalysis = await getDoc(doc(db, 'analyses', docRef.id));
    expect(savedAnalysis.exists()).toBeTruthy();
    expect(savedAnalysis.data().analysis.species).toBe('Rose');
  });

  it('integrates with caching system', async () => {
    // Test cache integration
    const mockAnalysis = {
      species: 'Cached Rose',
      health: true,
      careInstructions: 'Water daily'
    };
    
    await cache.set('test-cache-key', mockAnalysis, 3600);
    const cachedResult = await cache.get('test-cache-key');
    expect(cachedResult).toEqual(mockAnalysis);
  });

  it('handles real-time updates', (done) => {
    const unsubscribe = db.collection('analyses')
      .where('userId', '==', 'test-user')
      .onSnapshot((snapshot) => {
        expect(snapshot.docChanges().length).toBeGreaterThan(0);
        unsubscribe();
        done();
      });

    // Add test analysis
    db.collection('analyses').add({
      userId: 'test-user',
      analysis: { species: 'Test Plant' },
      timestamp: new Date()
    });
  });
});