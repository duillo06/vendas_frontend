import { useCallback, useState } from "react";

import { apiClient } from "@/shared/lib/api-client";
import { roundGeoCoordinate } from "@/shared/lib/geo";

export type GeoCityStatus = "idle" | "prompting" | "ready" | "denied" | "error";

export type GeoCityResult = {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
};

type ReverseResponse = {
  city: string;
  state: string;
};

export function useGeolocationCity() {
  const [status, setStatus] = useState<GeoCityStatus>("idle");
  const [result, setResult] = useState<GeoCityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  const request = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Seu navegador não informa localização");
      return null;
    }

    setStatus("prompting");
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 60_000,
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const { data } = await apiClient.get<ReverseResponse>("/public/geo/reverse/", {
        params: { lat: latitude, lng: longitude },
      });

      const next: GeoCityResult = {
        city: data.city,
        state: data.state.toUpperCase(),
        latitude: roundGeoCoordinate(latitude),
        longitude: roundGeoCoordinate(longitude),
      };
      setResult(next);
      setStatus("ready");
      return next;
    } catch (err) {
      const geoErr = err as GeolocationPositionError | undefined;
      if (geoErr && typeof geoErr.code === "number" && geoErr.code === 1) {
        setStatus("denied");
        setError("Permissão de localização negada");
      } else {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Não deu para descobrir sua cidade",
        );
      }
      return null;
    }
  }, []);

  return { status, result, error, request, clear };
}
