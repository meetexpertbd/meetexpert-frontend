"use client"

import { useGet } from "./use-get"

export type TaxonomySkill = {
  id: number
  name: string
  slug: string
}

export type TaxonomySubcategory = {
  id: number
  name: string
  slug: string
  skills: TaxonomySkill[]
}

export type TaxonomyCategory = {
  id: number
  name: string
  slug: string
  subcategories: TaxonomySubcategory[]
}

type TaxonomyResponse = {
  success: boolean
  message: string
  data: {
    categories: TaxonomyCategory[]
  }
}

const TAXONOMY_URL = "/taxonomy"

export function useTaxonomy() {
  const { data, isLoading, isError, refetch } = useGet<TaxonomyResponse>(TAXONOMY_URL)

  const categories = data?.data?.categories ?? []

  function getSubcategories(categoryId: number): TaxonomySubcategory[] {
    return categories.find((c) => c.id === categoryId)?.subcategories ?? []
  }

  function getSkills(categoryId: number, subcategoryId: number): TaxonomySkill[] {
    return getSubcategories(categoryId).find((s) => s.id === subcategoryId)?.skills ?? []
  }

  return { categories, isLoading, isError, refetch, getSubcategories, getSkills }
}
