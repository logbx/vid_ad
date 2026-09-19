import { describe, it, expect } from '@jest/globals';
import {
  adGenerationSchema,
  productNameSchema,
  productDescriptionSchema,
  keywordsSchema,
  BrandTone,
  VideoOrientation,
  VideoResolution,
  VideoFrameRate,
  ReplicateModel,
  VideoWorkflow,
  isValidHexColor,
  formatKeywordsToString,
  getModelPricing,
  estimateGenerationCost,
} from '../adGenerationSchema';

describe('adGenerationSchema', () => {
  describe('Valid input - happy path', () => {
    it('should parse valid form data with all required fields', () => {
      const validData = {
        productName: 'Test Product',
        productDescription: 'This is a test product description with enough characters.',
        keywords: 'test,product,keywords',
        brandTone: BrandTone.PROFESSIONAL,
        primaryColor: '#FF5733',
        variations: 2,
        duration: 7,
        orientation: VideoOrientation.LANDSCAPE,
        resolution: VideoResolution.FHD_1080P,
        frameRate: 30,
        videoModel: ReplicateModel.SEEDANCE_LITE,
        workflow: VideoWorkflow.IMAGE_TO_VIDEO,
        includeVoiceover: true,
        voiceStyle: 'alloy',
        includeBackgroundMusic: true,
      };

      const result = adGenerationSchema.parse(validData);
      expect(result.productName).toBe('Test Product');
      expect(result.keywords).toEqual(['test', 'product', 'keywords']);
      expect(result.variations).toBe(2);
    });

    it('should apply default values for optional fields', () => {
      const minimalData = {
        productName: 'Minimal Product',
        productDescription: 'A minimal product description for testing.',
        keywords: 'minimal',
      };

      const result = adGenerationSchema.parse(minimalData);
      expect(result.brandTone).toBe(BrandTone.PROFESSIONAL);
      expect(result.primaryColor).toBe('#000000');
      expect(result.variations).toBe(1);
      expect(result.duration).toBe(7);
      expect(result.orientation).toBe(VideoOrientation.LANDSCAPE);
      expect(result.resolution).toBe(VideoResolution.FHD_1080P);
      expect(result.frameRate).toBe(30);
      expect(result.videoModel).toBe(ReplicateModel.SEEDANCE_LITE);
      expect(result.workflow).toBe(VideoWorkflow.IMAGE_TO_VIDEO);
      expect(result.includeVoiceover).toBe(true);
      expect(result.includeBackgroundMusic).toBe(true);
    });
  });

  describe('productName validation', () => {
    it('should reject empty product name', () => {
      expect(() => productNameSchema.parse('')).toThrow('Product name is required');
    });

    it('should reject product name over 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => productNameSchema.parse(longName)).toThrow(
        'Product name must be 100 characters or less'
      );
    });

    it('should trim whitespace from product name', () => {
      const result = productNameSchema.parse('  Test Product  ');
      expect(result).toBe('Test Product');
    });

    it('should accept product name with exactly 100 characters', () => {
      const exactName = 'a'.repeat(100);
      const result = productNameSchema.parse(exactName);
      expect(result).toBe(exactName);
    });
  });

  describe('productDescription validation', () => {
    it('should reject description shorter than 10 characters', () => {
      expect(() => productDescriptionSchema.parse('Short')).toThrow(
        'Product description must be at least 10 characters'
      );
    });

    it('should reject description over 500 characters', () => {
      const longDesc = 'a'.repeat(501);
      expect(() => productDescriptionSchema.parse(longDesc)).toThrow(
        'Product description must be 500 characters or less'
      );
    });

    it('should accept description with exactly 10 characters', () => {
      const result = productDescriptionSchema.parse('1234567890');
      expect(result).toBe('1234567890');
    });

    it('should trim whitespace from description', () => {
      const result = productDescriptionSchema.parse('  Valid description text  ');
      expect(result).toBe('Valid description text');
    });
  });

  describe('keywords validation and transformation', () => {
    it('should transform comma-separated keywords to array', () => {
      const result = keywordsSchema.parse('keyword1,keyword2,keyword3');
      expect(result).toEqual(['keyword1', 'keyword2', 'keyword3']);
    });

    it('should trim whitespace from keywords', () => {
      const result = keywordsSchema.parse('  keyword1  ,  keyword2  ,  keyword3  ');
      expect(result).toEqual(['keyword1', 'keyword2', 'keyword3']);
    });

    it('should filter out empty keywords', () => {
      const result = keywordsSchema.parse('keyword1,,keyword2,,,keyword3');
      expect(result).toEqual(['keyword1', 'keyword2', 'keyword3']);
    });

    it('should require at least one keyword', () => {
      expect(() => keywordsSchema.parse('')).toThrow('At least one keyword is required');
      expect(() => keywordsSchema.parse(',,,,')).toThrow('At least one keyword is required');
    });

    it('should reject more than 10 keywords', () => {
      const manyKeywords = Array(11)
        .fill('keyword')
        .join(',');
      expect(() => keywordsSchema.parse(manyKeywords)).toThrow('Maximum 10 keywords allowed');
    });

    it('should accept exactly 10 keywords', () => {
      const tenKeywords = Array(10)
        .fill('keyword')
        .map((k, i) => `${k}${i}`)
        .join(',');
      const result = keywordsSchema.parse(tenKeywords);
      expect(result).toHaveLength(10);
    });
  });

  describe('primaryColor validation', () => {
    it('should reject invalid hex color format', () => {
      expect(() =>
        adGenerationSchema.parse({
          productName: 'Test',
          productDescription: 'Test description',
          keywords: 'test',
          primaryColor: 'not-a-color',
        })
      ).toThrow('Invalid color format');
    });

    it('should accept 6-digit hex colors', () => {
      const result = adGenerationSchema.parse({
        productName: 'Test',
        productDescription: 'Test description',
        keywords: 'test',
        primaryColor: '#FF5733',
      });
      expect(result.primaryColor).toBe('#FF5733');
    });

    it('should accept 3-digit hex colors', () => {
      const result = adGenerationSchema.parse({
        productName: 'Test',
        productDescription: 'Test description',
        keywords: 'test',
        primaryColor: '#F57',
      });
      expect(result.primaryColor).toBe('#F57');
    });

    it('should accept lowercase hex colors', () => {
      const result = adGenerationSchema.parse({
        productName: 'Test',
        productDescription: 'Test description',
        keywords: 'test',
        primaryColor: '#ff5733',
      });
      expect(result.primaryColor).toBe('#ff5733');
    });
  });

  describe('variations validation', () => {
    it('should reject variations less than 1', () => {
      expect(() =>
        adGenerationSchema.parse({
          productName: 'Test',
          productDescription: 'Test description',
          keywords: 'test',
          variations: 0,
        })
      ).toThrow('Minimum 1 variation required');
    });

    it('should reject variations greater than 3', () => {
      expect(() =>
        adGenerationSchema.parse({
          productName: 'Test',
          productDescription: 'Test description',
          keywords: 'test',
          variations: 4,
        })
      ).toThrow('Maximum 3 variations allowed');
    });

    it('should reject non-integer variations', () => {
      expect(() =>
        adGenerationSchema.parse({
          productName: 'Test',
          productDescription: 'Test description',
          keywords: 'test',
          variations: 1.5,
        })
      ).toThrow('Variations must be a whole number');
    });
  });

  describe('duration validation', () => {
    it('should reject duration less than 5 seconds', () => {
      expect(() =>
        adGenerationSchema.parse({
          productName: 'Test',
          productDescription: 'Test description',
          keywords: 'test',
          duration: 4,
        })
      ).toThrow('Minimum duration is 5 seconds');
    });

    it('should reject duration greater than 10 seconds', () => {
      expect(() =>
        adGenerationSchema.parse({
          productName: 'Test',
          productDescription: 'Test description',
          keywords: 'test',
          duration: 11,
        })
      ).toThrow('Maximum duration is 10 seconds');
    });

    it('should accept boundary values', () => {
      const min = adGenerationSchema.parse({
        productName: 'Test',
        productDescription: 'Test description',
        keywords: 'test',
        duration: 5,
      });
      expect(min.duration).toBe(5);

      const max = adGenerationSchema.parse({
        productName: 'Test',
        productDescription: 'Test description',
        keywords: 'test',
        duration: 10,
      });
      expect(max.duration).toBe(10);
    });
  });

  describe('frameRate validation', () => {
    it('should accept valid frame rates (24, 30, 60)', () => {
      [24, 30, 60].forEach((fps) => {
        const result = adGenerationSchema.parse({
          productName: 'Test',
          productDescription: 'Test description',
          keywords: 'test',
          frameRate: fps,
        });
        expect(result.frameRate).toBe(fps);
      });
    });

    it('should reject invalid frame rates', () => {
      expect(() =>
        adGenerationSchema.parse({
          productName: 'Test',
          productDescription: 'Test description',
          keywords: 'test',
          frameRate: 25,
        })
      ).toThrow('Frame rate must be 24, 30, or 60 fps');
    });
  });
});

describe('Helper functions', () => {
  describe('isValidHexColor', () => {
    it('should return true for valid 6-digit hex colors', () => {
      expect(isValidHexColor('#FF5733')).toBe(true);
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#abcdef')).toBe(true);
    });

    it('should return true for valid 3-digit hex colors', () => {
      expect(isValidHexColor('#F57')).toBe(true);
      expect(isValidHexColor('#000')).toBe(true);
      expect(isValidHexColor('#FFF')).toBe(true);
      expect(isValidHexColor('#abc')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidHexColor('FF5733')).toBe(false); // Missing #
      expect(isValidHexColor('#FF57')).toBe(false); // 4 digits
      expect(isValidHexColor('#FF57333')).toBe(false); // 7 digits
      expect(isValidHexColor('#GG5733')).toBe(false); // Invalid characters
      expect(isValidHexColor('rgb(255, 87, 51)')).toBe(false); // Different format
      expect(isValidHexColor('')).toBe(false); // Empty string
    });
  });

  describe('formatKeywordsToString', () => {
    it('should join keywords with comma and space', () => {
      const keywords = ['keyword1', 'keyword2', 'keyword3'];
      expect(formatKeywordsToString(keywords)).toBe('keyword1, keyword2, keyword3');
    });

    it('should handle single keyword', () => {
      expect(formatKeywordsToString(['single'])).toBe('single');
    });

    it('should handle empty array', () => {
      expect(formatKeywordsToString([])).toBe('');
    });
  });

  describe('getModelPricing', () => {
    it('should return correct pricing for seedance-1-lite at different resolutions', () => {
      expect(getModelPricing(ReplicateModel.SEEDANCE_LITE, '480p')).toBe(0.018);
      expect(getModelPricing(ReplicateModel.SEEDANCE_LITE, '720p')).toBe(0.036);
      expect(getModelPricing(ReplicateModel.SEEDANCE_LITE, '1080p')).toBe(0.072);
    });

    it('should return correct pricing for seedance-1-pro at different resolutions', () => {
      expect(getModelPricing(ReplicateModel.SEEDANCE_PRO, '480p')).toBe(0.03);
      expect(getModelPricing(ReplicateModel.SEEDANCE_PRO, '720p')).toBe(0.06);
      expect(getModelPricing(ReplicateModel.SEEDANCE_PRO, '1080p')).toBe(0.15);
    });

    it('should default to 720p pricing when resolution not specified', () => {
      expect(getModelPricing(ReplicateModel.SEEDANCE_LITE)).toBe(0.036);
      expect(getModelPricing(ReplicateModel.SEEDANCE_PRO)).toBe(0.06);
    });

    it('should return default fallback (0.036) for unknown model', () => {
      expect(getModelPricing('unknown-model' as any, '720p')).toBe(0.036);
    });

    it('should return default fallback for unknown resolution', () => {
      expect(getModelPricing(ReplicateModel.SEEDANCE_LITE, 'unknown' as any)).toBe(0.036);
    });
  });

  describe('estimateGenerationCost', () => {
    it('should calculate cost correctly (price × duration × variations)', () => {
      // Seedance Lite, 720p, 7 seconds, 2 variations
      // 0.036 × 7 × 2 = 0.504
      const cost = estimateGenerationCost(ReplicateModel.SEEDANCE_LITE, 7, 2, '720p');
      expect(cost).toBe(0.504);
    });

    it('should calculate cost for single variation', () => {
      // Seedance Pro, 1080p, 5 seconds, 1 variation
      // 0.15 × 5 × 1 = 0.75
      const cost = estimateGenerationCost(ReplicateModel.SEEDANCE_PRO, 5, 1, '1080p');
      expect(cost).toBe(0.75);
    });

    it('should calculate cost for multiple variations', () => {
      // Seedance Lite, 480p, 10 seconds, 3 variations
      // 0.018 × 10 × 3 = 0.54
      const cost = estimateGenerationCost(ReplicateModel.SEEDANCE_LITE, 10, 3, '480p');
      expect(cost).toBe(0.54);
    });

    it('should default to 720p when resolution not specified', () => {
      // Seedance Lite, default 720p, 7 seconds, 1 variation
      // 0.036 × 7 × 1 = 0.252
      const cost = estimateGenerationCost(ReplicateModel.SEEDANCE_LITE, 7, 1);
      expect(cost).toBe(0.252);
    });

    it('should handle zero variations correctly', () => {
      const cost = estimateGenerationCost(ReplicateModel.SEEDANCE_LITE, 7, 0, '720p');
      expect(cost).toBe(0);
    });
  });
});

describe('Enum values', () => {
  describe('BrandTone', () => {
    it('should contain all expected brand tone values', () => {
      expect(BrandTone.PROFESSIONAL).toBe('professional');
      expect(BrandTone.CASUAL).toBe('casual');
      expect(BrandTone.PLAYFUL).toBe('playful');
      expect(BrandTone.LUXURY).toBe('luxury');
      expect(BrandTone.ENERGETIC).toBe('energetic');
      expect(BrandTone.MINIMALIST).toBe('minimalist');
    });
  });

  describe('VideoOrientation', () => {
    it('should contain all expected orientation values', () => {
      expect(VideoOrientation.PORTRAIT).toBe('portrait');
      expect(VideoOrientation.LANDSCAPE).toBe('landscape');
      expect(VideoOrientation.SQUARE).toBe('square');
    });
  });

  describe('VideoResolution', () => {
    it('should contain all expected resolution values', () => {
      expect(VideoResolution.HD_720P).toBe('720p');
      expect(VideoResolution.FHD_1080P).toBe('1080p');
      expect(VideoResolution.UHD_4K).toBe('4k');
    });
  });

  describe('VideoFrameRate', () => {
    it('should contain all expected frame rate values', () => {
      expect(VideoFrameRate.FPS_24).toBe(24);
      expect(VideoFrameRate.FPS_30).toBe(30);
      expect(VideoFrameRate.FPS_60).toBe(60);
    });
  });

  describe('ReplicateModel', () => {
    it('should contain all expected model values', () => {
      expect(ReplicateModel.SEEDANCE_LITE).toBe('seedance-1-lite');
      expect(ReplicateModel.SEEDANCE_PRO).toBe('seedance-1-pro');
      expect(ReplicateModel.KLING_TURBO_PRO).toBe('kling-v2.5-turbo-pro');
    });
  });

  describe('VideoWorkflow', () => {
    it('should contain all expected workflow values', () => {
      expect(VideoWorkflow.IMAGE_TO_VIDEO).toBe('image-to-video');
      expect(VideoWorkflow.TEXT_TO_VIDEO).toBe('text-to-video');
      expect(VideoWorkflow.YOLO_MODE).toBe('yolo-mode');
    });
  });
});
