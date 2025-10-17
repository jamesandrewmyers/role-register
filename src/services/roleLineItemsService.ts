import { db } from "@/lib/db";
import { roleLineItems } from "@/lib/schema";
import { eq } from "drizzle-orm";
import * as mapper from "@/domain/mappers/roleLineItemsMapper";
import type { RoleLineItems, RoleLineItemsId, LineItemType } from "@/domain/entities/roleLineItems";
import type { RoleListingId } from "@/domain/entities/roleListing";

export function getLineItemsByListingId(listingId: RoleListingId): RoleLineItems[] {
  const results = db
    .select()
    .from(roleLineItems)
    .where(eq(roleLineItems.listingId, listingId as string))
    .all();
  
  return mapper.toDomainMany(results);
}

export interface CreateLineItemData {
  id: string;
  listingId: string;
  description: string;
  type: LineItemType;
  createdAt?: number;
}

export function createLineItem(data: CreateLineItemData): RoleLineItems {
  const result = db
    .insert(roleLineItems)
    .values({
      id: data.id,
      listingId: data.listingId,
      description: data.description,
      type: data.type,
      createdAt: data.createdAt || Math.floor(Date.now() / 1000),
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export function createLineItems(
  listingId: RoleListingId,
  lineItems: CreateLineItemData[]
): RoleLineItems[] {
  if (lineItems.length === 0) return [];
  
  const results = db
    .insert(roleLineItems)
    .values(
      lineItems.map((item) => ({
        id: item.id,
        listingId: listingId as string,
        description: item.description,
        type: item.type,
        createdAt: item.createdAt || Math.floor(Date.now() / 1000),
      }))
    )
    .returning()
    .all();
  
  return mapper.toDomainMany(results);
}

export function deleteLineItemsByListingId(listingId: RoleListingId): number {
  const result = db
    .delete(roleLineItems)
    .where(eq(roleLineItems.listingId, listingId as string))
    .returning()
    .all();
  
  return result.length;
}

export function deleteLineItem(id: RoleLineItemsId): boolean {
  const result = db
    .delete(roleLineItems)
    .where(eq(roleLineItems.id, id as string))
    .returning()
    .get();
  
  return !!result;
}
