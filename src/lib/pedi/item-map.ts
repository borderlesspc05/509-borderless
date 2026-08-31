import {
  PEDI_AREA_MAX_RAW,
  PEDI_AREA_PREFIX,
  PEDI_DOMAIN_DEFS,
} from "@/lib/pedi/constants";
import { assertPediCatalogIntegrity, PEDI_ITEM_TEXTS } from "@/lib/pedi/items-catalog";
import {
  getMobilityTransferDomainLabel,
  PEDI_MOBILITY_TRANSFER_TEXTS,
  type PediTransferMode,
} from "@/lib/pedi/transfer-mode";
import {
  PEDI_AREAS,
  type PediArea,
  type PediDomainGroup,
  type PediItemDefinition,
} from "@/lib/pedi/types";

assertPediCatalogIntegrity();

function buildItemsForArea(
  area: PediArea,
  transferMode: PediTransferMode = "car"
): PediItemDefinition[] {
  const prefix = PEDI_AREA_PREFIX[area];
  const domains = PEDI_DOMAIN_DEFS[area];
  const texts = [...PEDI_ITEM_TEXTS[area]];
  const items: PediItemDefinition[] = [];
  let globalIndex = 0;

  if (area === "mobility") {
    const transferTexts = PEDI_MOBILITY_TRANSFER_TEXTS[transferMode];
    for (let index = 0; index < 5; index += 1) {
      texts[10 + index] = transferTexts[index];
    }
  }

  for (const domain of domains) {
    for (let i = 1; i <= domain.itemCount; i += 1) {
      const text = texts[globalIndex];
      if (!text) {
        throw new Error(
          `Enunciado PEDI ausente para ${area} índice ${globalIndex + 1}`
        );
      }

      globalIndex += 1;
      const padded = String(globalIndex).padStart(2, "0");
      const domainLabel =
        area === "mobility" && domain.code === "C"
          ? getMobilityTransferDomainLabel(transferMode)
          : domain.label;

      items.push({
        id: `${prefix}-${padded}`,
        area,
        domainCode: domain.code,
        domainLabel,
        sortOrder: globalIndex,
        label: `${prefix}-${padded}`,
        text,
      });
    }
  }

  const expected = PEDI_AREA_MAX_RAW[area];
  if (items.length !== expected) {
    throw new Error(
      `PEDI item map inválido para ${area}: ${items.length} ≠ ${expected}`
    );
  }

  return items;
}

export function getPediItems(
  transferMode: PediTransferMode = "car"
): PediItemDefinition[] {
  return PEDI_AREAS.flatMap((area) => buildItemsForArea(area, transferMode));
}

export function getPediItemsByArea(
  transferMode: PediTransferMode = "car"
): Record<PediArea, PediItemDefinition[]> {
  const items = getPediItems(transferMode);
  return {
    self_care: items.filter((item) => item.area === "self_care"),
    mobility: items.filter((item) => item.area === "mobility"),
    social_function: items.filter((item) => item.area === "social_function"),
  };
}

export const PEDI_ITEMS = getPediItems("car");

export const PEDI_ITEMS_BY_AREA = getPediItemsByArea("car");

export function getPediDomainGroups(
  area: PediArea,
  transferMode: PediTransferMode = "car"
): PediDomainGroup[] {
  const items = getPediItemsByArea(transferMode)[area];
  const byDomain = new Map<string, PediItemDefinition[]>();

  for (const item of items) {
    const list = byDomain.get(item.domainCode) ?? [];
    list.push(item);
    byDomain.set(item.domainCode, list);
  }

  return PEDI_DOMAIN_DEFS[area].map((domain) => ({
    area,
    domainCode: domain.code,
    domainLabel: domain.label,
    items: byDomain.get(domain.code) ?? [],
  }));
}

export function createEmptyPediAnswers(): Record<string, 0 | 1> {
  const answers: Record<string, 0 | 1> = {};
  for (const item of PEDI_ITEMS) {
    answers[item.id] = 0;
  }
  return answers;
}
