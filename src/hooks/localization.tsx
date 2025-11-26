import { useState, useCallback, useRef, useEffect } from "react";

interface AddressData {
   road?: string;
   suburb?: string;
   neighbourhood?: string;
   city?: string;
   town?: string;
   village?: string;
   state?: string;
   country?: string;
   postcode?: string;
   county?: string;
   city_district?: string;
   municipality?: string;
   display_name?: string;
}

interface LocationData {
   lat: number;
   lon: number;
   accuracy?: number;
   timestamp?: number;
   address?: AddressData;
}

interface UseLocationReturn {
   location: LocationData | null;
   loading: boolean;
   error: string | null;
   address: AddressData | null;
   addressLoading: boolean;
   getLocation: (getAddress?: boolean) => Promise<LocationData | null>;
   getAddress: (lat: number, lon: number) => Promise<AddressData | null>;
   clearLocation: () => void;
   formattedAddress: string | null;
   postalCode: string | null;
   city: string | null;
   colony: string | null;
   state: string | null;
}

// Cache global con mejor estructura
const cache = {
   location: null as LocationData | null,
   address: new Map<string, { data: AddressData; timestamp: number }>(),
   lastFetch: 0,
   CACHE_DURATION: 5 * 60 * 1000 // 5 minutos
};

// Rate limiting para Nominatim
let lastNominatimCall = 0;
const NOMINATIM_DELAY = 1000; // 1 segundo entre llamadas

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useLocation = (options?: PositionOptions): UseLocationReturn => {
   const [location, setLocation] = useState<LocationData | null>(null);
   const [address, setAddress] = useState<AddressData | null>(null);
   const [loading, setLoading] = useState(false);
   const [addressLoading, setAddressLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const isFetching = useRef(false);
   const abortController = useRef<AbortController | null>(null);

   // Limpiar al desmontar
   useEffect(() => {
      return () => {
         if (abortController.current) {
            abortController.current.abort();
         }
      };
   }, []);

   const formatAddress = useCallback((addressData: AddressData | null): string => {
      if (!addressData) return "";

      const parts = [
         addressData.road,
         addressData.suburb || addressData.neighbourhood,
         addressData.city || addressData.town || addressData.village || addressData.municipality,
         addressData.state,
         addressData.postcode
      ].filter(Boolean);

      return parts.join(", ");
   }, []);

   const getAddress = useCallback(async (lat: number, lon: number): Promise<AddressData | null> => {
      const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`; // Reducir precisión para mejor cache
      const now = Date.now();

      // Verificar cache
      const cached = cache.address.get(cacheKey);
      if (cached && now - cached.timestamp < cache.CACHE_DURATION) {
         console.log("✅ Dirección en cache");
         setAddress(cached.data);
         return cached.data;
      }

      // Rate limiting
      const timeSinceLastCall = now - lastNominatimCall;
      if (timeSinceLastCall < NOMINATIM_DELAY) {
         await wait(NOMINATIM_DELAY - timeSinceLastCall);
      }

      setAddressLoading(true);
      lastNominatimCall = Date.now();

      try {
         abortController.current = new AbortController();

         console.log("🌍 Consultando dirección...");

         // Usar múltiples APIs como fallback
         let addressData: AddressData | null = null;

         // Intentar primero con Nominatim
         try {
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

            const response = await fetch(nominatimUrl, {
               signal: abortController.current.signal,
               headers: {
                  "Accept-Language": "es",
                  "User-Agent": "LocationApp/1.0"
               }
            });

            if (response.ok) {
               const data = await response.json();
               addressData = data.address;
               console.log("✅ Dirección obtenida:", addressData);
            }
         } catch (nominatimError) {
            console.warn("⚠️ Error con Nominatim, intentando alternativa...");

            // Fallback: usar BigDataCloud (sin rate limit tan estricto)
            try {
               const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`;
               const bdcResponse = await fetch(bdcUrl, {
                  signal: abortController.current.signal
               });

               if (bdcResponse.ok) {
                  const bdcData = await bdcResponse.json();
                  addressData = {
                     road: bdcData.localityInfo?.administrative?.[0]?.name,
                     suburb: bdcData.locality,
                     city: bdcData.city,
                     state: bdcData.principalSubdivision,
                     country: bdcData.countryName,
                     postcode: bdcData.postcode
                  };
                  console.log("✅ Dirección obtenida (fallback):", addressData);
               }
            } catch (bdcError) {
               console.error("❌ Error en ambas APIs");
            }
         }

         if (addressData) {
            // Guardar en cache
            cache.address.set(cacheKey, {
               data: addressData,
               timestamp: now
            });
            setAddress(addressData);
            setAddressLoading(false);
            return addressData;
         }

         throw new Error("No se pudo obtener la dirección");
      } catch (error: any) {
         if (error.name !== "AbortError") {
            console.error("❌ Error obteniendo dirección:", error);
         }
         setAddressLoading(false);
         return null;
      }
   }, []);

   const getLocation = useCallback(
      async (getAddressData: boolean = false): Promise<LocationData | null> => {
         // Evitar múltiples llamadas simultáneas
         if (isFetching.current) {
            console.log("⏳ Ya hay una petición en curso...");
            return location;
         }

         // Usar cache si es reciente
         const now = Date.now();
         if (cache.location && now - cache.lastFetch < 30000) {
            console.log("♻️ Usando ubicación en cache");
            setLocation(cache.location);

            if (getAddressData && cache.location.address) {
               setAddress(cache.location.address);
            } else if (getAddressData) {
               getAddress(cache.location.lat, cache.location.lon);
            }

            return cache.location;
         }

         if (!navigator.geolocation) {
            setError("Geolocalización no soportada");
            return null;
         }

         isFetching.current = true;
         setLoading(true);
         setError(null);

         const defaultOptions: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0, // Siempre obtener ubicación fresca
            ...options
         };

         try {
            const coords = await new Promise<LocationData | null>((resolve) => {
               navigator.geolocation.getCurrentPosition(
                  async (position) => {
                     const locationData: LocationData = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                     };

                     console.log("✅ Ubicación obtenida:", locationData);
                     setLocation(locationData);

                     // Actualizar cache
                     cache.location = locationData;
                     cache.lastFetch = Date.now();

                     // Obtener dirección en paralelo si se solicita
                     if (getAddressData) {
                        // No esperar, obtener en background
                        getAddress(locationData.lat, locationData.lon).then((addr) => {
                           if (addr) {
                              locationData.address = addr;
                              cache.location = locationData;
                           }
                        });
                     }

                     setLoading(false);
                     isFetching.current = false;
                     resolve(locationData);
                  },
                  (error) => {
                     const errorMessages: Record<number, string> = {
                        1: "Permiso denegado. Habilita la ubicación en tu navegador.",
                        2: "Ubicación no disponible. Verifica tu GPS/WiFi.",
                        3: "Tiempo de espera agotado. Intenta nuevamente."
                     };

                     const message = errorMessages[error.code] || "Error al obtener ubicación";
                     console.error("❌", message);

                     setError(message);
                     setLoading(false);
                     isFetching.current = false;
                     resolve(null);
                  },
                  defaultOptions
               );
            });

            return coords;
         } catch (err) {
            console.error("Error inesperado:", err);
            setError("Error inesperado");
            setLoading(false);
            isFetching.current = false;
            return null;
         }
      },
      [location, getAddress, options]
   );

   const clearLocation = useCallback(() => {
      setLocation(null);
      setAddress(null);
      setError(null);
      cache.location = null;
      // No limpiar cache de direcciones (pueden ser útiles)
   }, []);

   return {
      location,
      loading,
      error,
      address,
      addressLoading,
      getLocation,
      getAddress,
      clearLocation,
      formattedAddress: formatAddress(address),
      postalCode: address?.postcode || null,
      city: address?.city || address?.town || address?.village || address?.municipality || null,
      colony: address?.suburb || address?.neighbourhood || null,
      state: address?.state || null
   };
};
