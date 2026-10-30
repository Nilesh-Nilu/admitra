import type { FilterSection, FilterValues } from "@/components/filters/FilterSheet";
import { getFilteredAdsApi } from "@/constants/functions";
import { getProfileAge } from "@/constants/matrimony";
import { useEffect, useMemo, useState } from "react";

type Module = "normal" | "featured" | "banner" | "matrimony";

const SORTS: Record<string, { label: string; sort_by: string; sort_direction: "asc" | "desc" }> = {
  newest: { label: "Newest First", sort_by: "created_at", sort_direction: "desc" },
  oldest: { label: "Oldest First", sort_by: "created_at", sort_direction: "asc" },
  price_asc: { label: "Price: Low to High", sort_by: "price", sort_direction: "asc" },
  price_desc: { label: "Price: High to Low", sort_by: "price", sort_direction: "desc" },
};

const AD_DEFAULTS: FilterValues = { categoryId: null, minPrice: "", maxPrice: "", sort: "newest" };
const MATRIMONY_DEFAULTS: FilterValues = { genderId: null, religionId: null, minAge: "", maxAge: "", sort: "newest" };

const toNumber = (value: any) => (value === "" || value == null ? null : Number(value));
const time = (value: any) => new Date(value || 0).getTime() || 0;

/** Number of filters that differ from the defaults (drives the header badge). */
const countActive = (value: FilterValues, defaults: FilterValues) =>
  Object.keys(defaults).filter((key) => (value[key] ?? "") !== (defaults[key] ?? "")).length;

type Options = {
  /** Banner rows wrap their listing in `product`; return the listing to filter on. */
  getProduct?: (item: any) => any;
  categories?: any[];
  masters?: { genders?: any[]; religions?: any[] } | null;
};

/**
 * Filter state for a See All list. Filters are applied locally right away; when the
 * module's filter endpoint answers, its rows replace the local result.
 */
export function useListFilters(module: Module, items: any[], { getProduct = (item) => item, categories = [], masters }: Options = {}) {
  const isMatrimony = module === "matrimony";
  const defaults = isMatrimony ? MATRIMONY_DEFAULTS : AD_DEFAULTS;
  const [filters, setFilters] = useState<FilterValues>(defaults);
  const [serverRows, setServerRows] = useState<any[] | null>(null);
  const activeCount = countActive(filters, defaults);

  const sections: FilterSection[] = useMemo(() => {
    const sortKeys = isMatrimony ? ["newest", "oldest"] : Object.keys(SORTS);
    const sortSection: FilterSection = {
      key: "sort",
      title: "Sort By",
      type: "chips",
      options: sortKeys.map((key) => ({ value: key, label: SORTS[key].label })),
    };
    if (isMatrimony) {
      const chipsFrom = (rows: any[] = []) => [
        { value: null, label: "All" },
        ...rows.map((row) => ({ value: row.id, label: String(row.name ?? row.label ?? row.id) })),
      ];
      return [
        sortSection,
        { key: "genderId", title: "Gender", type: "chips", options: chipsFrom(masters?.genders) },
        { key: "religionId", title: "Religion", type: "chips", options: chipsFrom(masters?.religions) },
        { key: "age", title: "Age (years)", type: "range", minKey: "minAge", maxKey: "maxAge", minPlaceholder: "Min age", maxPlaceholder: "Max age" },
      ];
    }
    return [
      sortSection,
      {
        key: "categoryId",
        title: "Category",
        type: "chips",
        options: [{ value: null, label: "All" }, ...categories.map((cat: any) => ({ value: cat.id, label: cat.name }))],
      },
      { key: "price", title: "Price Range (₹)", type: "range", minKey: "minPrice", maxKey: "maxPrice", minPlaceholder: "Min", maxPlaceholder: "Max" },
    ];
  }, [isMatrimony, categories, masters]);

  useEffect(() => {
    if (activeCount === 0) {
      setServerRows(null);
      return;
    }
    const sort = SORTS[filters.sort] || SORTS.newest;
    const params: Record<string, any> = isMatrimony
      ? {
          gender_id: filters.genderId ?? undefined,
          religion_id: filters.religionId ?? undefined,
          min_age: toNumber(filters.minAge) ?? undefined,
          max_age: toNumber(filters.maxAge) ?? undefined,
          sort_by: sort.sort_by,
          sort_direction: sort.sort_direction,
        }
      : {
          category_id: filters.categoryId ?? undefined,
          min_price: toNumber(filters.minPrice) ?? undefined,
          max_price: toNumber(filters.maxPrice) ?? undefined,
          sort_by: sort.sort_by,
          sort_direction: sort.sort_direction,
        };
    let cancelled = false;
    getFilteredAdsApi(module, params).then((rows: any[] | null) => {
      if (!cancelled) setServerRows(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [module, isMatrimony, filters, activeCount]);

  const localRows = useMemo(() => {
    let rows = [...(items || [])];
    if (isMatrimony) {
      const minAge = toNumber(filters.minAge);
      const maxAge = toNumber(filters.maxAge);
      const idOf = (row: any, relation: string) => row?.[`${relation}_id`] ?? row?.[relation]?.id;
      if (filters.genderId != null) rows = rows.filter((row) => Number(idOf(row, "gender")) === Number(filters.genderId));
      if (filters.religionId != null) rows = rows.filter((row) => Number(idOf(row, "religion")) === Number(filters.religionId));
      if (minAge != null || maxAge != null) {
        rows = rows.filter((row) => {
          const age = getProfileAge(row);
          if (age == null) return false;
          return (minAge == null || age >= minAge) && (maxAge == null || age <= maxAge);
        });
      }
    } else {
      const minPrice = toNumber(filters.minPrice);
      const maxPrice = toNumber(filters.maxPrice);
      if (filters.categoryId != null) rows = rows.filter((row) => Number(getProduct(row)?.category_id) === Number(filters.categoryId));
      if (minPrice != null) rows = rows.filter((row) => Number(getProduct(row)?.price) >= minPrice);
      if (maxPrice != null) rows = rows.filter((row) => Number(getProduct(row)?.price) <= maxPrice);
    }
    const sort = SORTS[filters.sort] || SORTS.newest;
    const dir = sort.sort_direction === "asc" ? 1 : -1;
    rows.sort((a, b) =>
      sort.sort_by === "price"
        ? (Number(getProduct(a)?.price) - Number(getProduct(b)?.price)) * dir
        : (time(a?.created_at ?? getProduct(a)?.created_at) - time(b?.created_at ?? getProduct(b)?.created_at)) * dir
    );
    return rows;
    // getProduct is a stable accessor per screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filters, isMatrimony]);

  return {
    filters,
    setFilters,
    defaults,
    sections,
    activeCount,
    rows: serverRows ?? localRows,
  };
}
