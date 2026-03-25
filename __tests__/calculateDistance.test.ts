import { calculateDistance } from '../src/utils/calculateDistance';

describe('calculateDistance', () => {
  it('should return 0 for the same coordinates', () => {
    const lat = 23.0225;
    const lon = 72.5714;
    expect(calculateDistance(lat, lon, lat, lon)).toBe(0);
  });

  it('should correctly calculate distance between two known points', () => {
    // Ahmedabad (23.0225, 72.5714) to Mumbai (19.0760, 72.8777)
    // Distance approx 440km
    const ahmedabad = { lat: 23.0225, lon: 72.5714 };
    const mumbai = { lat: 19.0760, lon: 72.8777 };
    
    const distance = calculateDistance(ahmedabad.lat, ahmedabad.lon, mumbai.lat, mumbai.lon);
    
    // Using a tolerance check for floating point math
    expect(distance).toBeGreaterThan(435);
    expect(distance).toBeLessThan(445);
  });

  it('should handle negative coordinates (Southern/Western Hemisphere)', () => {
    // New York (40.7128, -74.0060) to London (51.5074, -0.1278)
    // Distance approx 5570km
    const ny = { lat: 40.7128, lon: -74.0060 };
    const london = { lat: 51.5074, lon: -0.1278 };
    
    const distance = calculateDistance(ny.lat, ny.lon, london.lat, london.lon);
    
    expect(distance).toBeGreaterThan(5560);
    expect(distance).toBeLessThan(5580);
  });
});
