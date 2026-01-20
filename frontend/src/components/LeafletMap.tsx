"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { useEffect, useState, useRef } from "react";

// Fix for default marker icon in Leaflet with Next.js/Webpack
const icon = L.icon({
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Hack to fix missing default icons if we don't have local assets yet
// We'll use CDN for standard markers as fallback if local doesn't exist plan
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
    destination: string;
    userLocation?: [number, number];
}

function RoutingMachine({ userLocation, destinationCoords }: { userLocation: [number, number], destinationCoords: [number, number] }) {
    const map = useMap();
    const routingControlRef = useRef<any>(null);

    useEffect(() => {
        if (!map) return;

        // Cleanup previous control if it exists (safety check)
        if (routingControlRef.current) {
            try {
                map.removeControl(routingControlRef.current);
            } catch (e) { console.warn("Cleanup error", e); }
            routingControlRef.current = null;
        }

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(destinationCoords[0], destinationCoords[1])
            ],
            routeWhileDragging: false,
            showAlternatives: true,
            fitSelectedRoutes: true,
            show: false
        });

        try {
            routingControl.addTo(map);
            routingControlRef.current = routingControl;
        } catch (e) {
            console.error("Error adding routing control:", e);
        }

        return () => {
            if (routingControlRef.current && map) {
                try {
                    // Check if map is still valid
                    if (map.getContainer()) {
                        map.removeControl(routingControlRef.current);
                    }
                } catch (e) {
                    // Swallow the "removeLayer of null" error which happens if map is already destroyed
                }
                routingControlRef.current = null;
            }
        };
    }, [map, userLocation, destinationCoords]);

    return null;
}

export default function LeafletMap({ destination, userLocation }: LeafletMapProps) {
    const [position, setPosition] = useState<[number, number]>([10.8505, 76.2711]); // Default fallback
    const [loading, setLoading] = useState(true);

    // Geocode destination
    useEffect(() => {
        const fetchCoords = async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                }
            } catch (err) {
                console.error("Geocoding failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCoords();
    }, [destination]);

    if (loading) {
        return <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-400">Locating...</div>;
    }

    return (
        <MapContainer center={position} zoom={7} scrollWheelZoom={true} className="w-full h-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <Marker position={position}>
                <Popup>
                    {destination}
                </Popup>
            </Marker>

            {userLocation && (
                <RoutingMachine userLocation={userLocation} destinationCoords={position} />
            )}

            {/* Show user location marker if no routing or as setup */}
            {userLocation && (
                <Marker position={userLocation} icon={icon}>
                    <Popup>You are here</Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
