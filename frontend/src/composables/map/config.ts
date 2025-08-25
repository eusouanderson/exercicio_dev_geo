import type { Info } from "@/types/geo";
import * as L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/**
 * corrige os ícones padrão do Leaflet em bundlers como o Vite/Webpack
 */

export function setupLeafletIcons() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
  });
}

/**
 * formata um nome de exibição a partir das informações de endereço.
 * remove valores vazios e duplicados para criar uma string limpa.
 */
export function formatDisplayName(info: Info): string {
  if (!info || !info.address) {
    return info?.display_name || "";
  }

  const { address } = info;
  const parts = [
    address.city_district,
    address.town,
    address.municipality,
    address.state_district,
    address.state,
    address.region,
    address.postcode,
    address.country,
  ];

  return Array.from(new Set(parts.filter(Boolean))).join(", ");
}

export function createPopupContentHtml(info: Info): string {
  const title = formatDisplayName(info);

  const lat = parseFloat(info.lat || "0").toFixed(6);
  const lon = parseFloat(info.lon || "0").toFixed(6);
  const country = info.address?.country || "N/A";
  const state = info.address?.state || "N/A";
  const type = info.type || "N/A";

  return `
    <div style="font-family: sans-serif; font-size: 14px; max-width: 280px;">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">${title}</h3>
      <hr style="border: 0; border-top: 1px solid #ccc; margin: 10px 0;">
      <p style="margin: 5px 0;"><strong>País:</strong> ${country}</p>
      <p style="margin: 5px 0;"><strong>Estado:</strong> ${state}</p>
      <p style="margin: 5px 0;"><strong>Tipo:</strong> ${type}</p>
      <p style="margin: 5px 0; font-size: 12px; color: #555;">
        <strong>Coords:</strong> ${lat}, ${lon}
      </p>
    </div>
  `;
}
