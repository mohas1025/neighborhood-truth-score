import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

function MapUpdater({ lat, lon }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], 13)
  }, [lat, lon])
  return null
}

export default MapUpdater