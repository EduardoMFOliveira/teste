// src/shared/utils/distance.util.ts
export class DistanceUtil {
  static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  }

  static formatDistance(distance: number): string {
    return distance < 1 
      ? `${Math.round(distance * 1000)} metros` 
      : `${distance.toFixed(1).replace('.', ',')} km`;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}