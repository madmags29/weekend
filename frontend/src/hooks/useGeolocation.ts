"use client";

import { useState, useEffect } from 'react';

interface LocationState {
    coords: {
        latitude: number;
        longitude: number;
    } | null;
    error: string | null;
    loading: boolean;
}

export function useGeolocation() {
    const [location, setLocation] = useState<LocationState>({
        coords: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocation({
                coords: null,
                error: "Geolocation is not supported by your browser",
                loading: false,
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                setLocation({
                    coords: null,
                    error: error.message,
                    loading: false,
                });
            }
        );
    }, []);

    return location;
}
