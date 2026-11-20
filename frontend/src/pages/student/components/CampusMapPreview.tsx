import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'

import { Badge } from '@/components/ui/badge'

import { CAMPUS_ROUTE, CAMPUS_STOPS } from '../campusMap'

/** Leaflet-only preview of the sample campus route and its major stops. */
export function CampusMapPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-muted">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Campus map</p>
          <p className="text-sm font-medium text-foreground">Illustrative route preview</p>
        </div>
        <Badge variant="secondary">Preview</Badge>
      </div>
      <div className="h-[260px] w-full">
        <MapContainer center={[7.435, 3.8985]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={CAMPUS_ROUTE} pathOptions={{ color: 'hsl(var(--primary))', weight: 5, opacity: 0.9 }} />
          {CAMPUS_STOPS.map((stop) => (
            <Marker key={stop.title} position={stop.position}>
              <Popup>{stop.title}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
