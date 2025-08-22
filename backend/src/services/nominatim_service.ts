export class NominatimService {
  static async reverse(lat: number, lon: number): Promise<Record<string, any>> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Geo/1.0 (eusouanderson@exemplo.com)',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar dados do serviço de geocoding.');
    }

    const data: unknown = await response.json();

    return data as Record<string, any>;
  }
}
