# Domain-Driven Architecture Migration Plan

## Current Status: Phase 2 Complete ✅

### ✅ Phase 1: Domain Entities (COMPLETE)
Created 13 domain entities with branded types:
- `eventInfo.ts`
- `dataReceived.ts`
- `roleCompany.ts`
- `roleListing.ts`
- `roleCallout.ts`
- `roleAttachment.ts`
- `roleContact.ts`
- `roleEvent.ts`
- `roleQualifications.ts`
- `roleState.ts`
- `roleLocation.ts`
- `settings.ts`

**Deliverable:** All entities in `src/domain/entities/` with branded ID types

### ✅ Phase 2: Persistence Mappers (COMPLETE)
Created 13 mappers with `toDomain()` and `toDomainMany()` functions:
- All mappers in `src/domain/mappers/`
- Pure functions for testability
- Handles nullable fields appropriately

**Deliverable:** All mappers complete and ready to use

---

## 🚧 Phase 3: Service Layer (IN PROGRESS)

### 3.1 Core Services to Create

#### High Priority (Most Used):
1. **`roleListingService.ts`**
   - `getAllRoleListings()` - Get all listings with filters
   - `getRoleListingById(id)` - Get single listing
   - `createRoleListing(data)` - Create new listing
   - `updateRoleListing(id, data)` - Update listing
   - `updateRoleListingStatus(id, status, appliedAt?)` - Update application status
   - `deleteRoleListing(id)` - Delete listing

2. **`dataReceivedService.ts`**
   - `getAllDataReceived()` - Get all captured data
   - `getDataReceivedById(id)` - Get single record
   - `createDataReceived(data)` - Create new record
   - `updateDataReceivedProcessing(id, processed, notes?)` - Update processing status

3. **`eventInfoService.ts`**
   - `getAllEvents()` - Get all events
   - `getEventById(id)` - Get single event
   - `createEvent(data)` - Create new event
   - `updateEventStatus(id, status, error?)` - Update event status
   - `incrementEventRetries(id)` - Increment retry count

4. **`roleEventService.ts`**
   - `getEventsByListingId(listingId)` - Get all events for a listing
   - `getEventById(id)` - Get single event
   - `createRoleEvent(data)` - Create new event
   - `updateRoleEvent(id, data)` - Update event
   - `deleteRoleEvent(id)` - Delete event

#### Medium Priority:
5. **`roleQualificationsService.ts`**
   - `getQualificationsByListingId(listingId)` - Get qualifications for listing
   - `createQualifications(listingId, qualifications[])` - Batch create
   - `deleteQualificationsByListingId(listingId)` - Batch delete

6. **`roleCompanyService.ts`**
   - `getAllCompanies()` - Get all companies
   - `getCompanyById(id)` - Get single company
   - `createCompany(data)` - Create or find existing
   - `getOrCreateCompany(name)` - Upsert logic

7. **`roleLocationService.ts`**
   - `getAllLocations()` - Get all locations
   - `getLocationById(id)` - Get single location
   - `createLocation(data)` - Create or find existing
   - `getOrCreateLocation(city, stateId)` - Upsert logic

8. **`roleStateService.ts`**
   - `getAllStates()` - Get all states
   - `getStateById(id)` - Get single state
   - `getStateByAbbreviation(abbr)` - Find by abbreviation

#### Lower Priority:
9. **`settingsService.ts`**
   - `getAllSettings()` - Get all settings
   - `getSettingByName(name)` - Get single setting
   - `updateSetting(name, value)` - Update or create

10. **`roleCalloutService.ts`, `roleAttachmentService.ts`, `roleContactService.ts`**
    - Basic CRUD operations as needed

### 3.2 Service Implementation Pattern

```typescript
// Example: roleListingService.ts
import { db } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import { eq } from "drizzle-orm";
import * as mapper from "@/domain/mappers/roleListingMapper";
import type { RoleListing, RoleListingId } from "@/domain/entities/roleListing";

export function getAllRoleListings(): RoleListing[] {
  const results = db.select().from(roleListing).all();
  return mapper.toDomainMany(results);
}

export function getRoleListingById(id: RoleListingId): RoleListing | null {
  const result = db.select().from(roleListing).where(eq(roleListing.id, id)).get();
  return result ? mapper.toDomain(result) : null;
}
```

**Deliverable:** All service files created in `src/services/`

---

## Phase 4: DTO Layer

### 4.1 DTOs to Create

For each major entity used in API routes, create DTO interfaces and converters:

1. **`dto/roleListing.dto.ts`**
   ```typescript
   export interface RoleListingDTO {
     id: string; // no branded type
     companyId: string | null;
     title: string;
     description: string;
     location: string | null;
     workArrangement: string;
     capturedAt: string; // ISO string instead of number
     dataReceivedId: string | null;
     status: string;
     appliedAt: string | null; // ISO string
   }
   
   export function toDTO(entity: RoleListing): RoleListingDTO { ... }
   export function fromDTO(dto: RoleListingDTO): RoleListing { ... }
   ```

2. **`dto/dataReceived.dto.ts`**
3. **`dto/eventInfo.dto.ts`**
4. **`dto/roleEvent.dto.ts`**

### 4.2 DTO Conversion Rules
- Strip branded types (IDs become plain strings)
- Convert timestamps to ISO strings or keep as numbers (consistency!)
- Make DTOs JSON-serializable
- Add validation if needed

**Deliverable:** DTO files in `src/dto/` with `toDTO()` and `fromDTO()` functions

---

## Phase 5: API Route Migration

### 5.1 API Routes to Update (Priority Order)

**High Priority:**
1. `/api/dashboard/route.ts` - Main dashboard data
2. `/api/role-listing/[id]/route.ts` - GET/PATCH listing
3. `/api/role-listing/[id]/events/route.ts` - GET/POST events
4. `/api/role-listing/[id]/events/[eventId]/route.ts` - PATCH/DELETE event
5. `/api/event/route.ts` - POST create event
6. `/api/event/[id]/route.ts` - GET event details

**Medium Priority:**
7. `/api/import/route.ts` - Import job data
8. `/api/admin/table-data/route.ts` - Admin table viewer
9. `/api/admin/tables/route.ts` - List tables
10. `/api/admin/delete-rows/route.ts` - Delete rows

**Lower Priority:**
11. `/api/settings/route.ts` - Settings CRUD
12. `/api/settings/[name]/route.ts` - Single setting
13. `/api/html/route.ts` - HTML proxy (may not need changes)

### 5.2 API Migration Pattern

**Before:**
```typescript
export async function GET(request: Request) {
  const listings = db.select().from(roleListing).all();
  return NextResponse.json(listings);
}
```

**After:**
```typescript
import * as roleListingService from "@/services/roleListingService";
import { toDTO } from "@/dto/roleListing.dto";

export async function GET(request: Request) {
  const listings = roleListingService.getAllRoleListings();
  const dtos = listings.map(toDTO);
  return NextResponse.json(dtos);
}
```

**Deliverable:** All API routes updated to use services and DTOs

---

## Phase 6: Component Migration

### 6.1 Components to Update (Priority Order)

**High Priority:**
1. `RoleListingMainView.tsx` - Main listing view
2. `RoleListingsList.tsx` - Listings list
3. `RoleListingDetails.tsx` - Listing details
4. `RoleListingEventList.tsx` - Event list
5. `RoleEventDetails.tsx` - Event details modal

**Medium Priority:**
6. `DataReceivedList.tsx` - Data received list
7. `DataReceivedDetails.tsx` - Data details modal
8. `EventInfoList.tsx` - Event queue list
9. `EventInfoDetails.tsx` - Event details modal
10. `RoleListingSearch.tsx` - Search interface

**Lower Priority:**
11. `AdminDialog.tsx` - Admin interface
12. `TableViewer.tsx` - Generic table viewer

### 6.2 Component Migration Pattern

**Before:**
```typescript
interface Props {
  listing: {
    id: string;
    title: string;
    // ... inline interface
  };
}
```

**After:**
```typescript
import type { RoleListing } from "@/domain/entities/roleListing";

interface Props {
  listing: RoleListing;
}
```

**Component-Specific Considerations:**
- Components receive domain entities as props
- API calls return DTOs, convert to domain entities
- Use domain types throughout component logic
- Remove any direct `$inferSelect` imports

**Deliverable:** All components using domain entities, no schema imports

---

## Phase 7: Worker Migration

### 7.1 Worker Files to Update
1. `src/worker.ts` - Background job processor
2. `src/queueRunner.ts` - Queue management

### 7.2 Worker Pattern
Workers should:
- Use services for all DB access
- Work with domain entities internally
- No direct Drizzle imports except via services

**Deliverable:** Worker using services, no direct DB access

---

## Phase 8: Verification & Cleanup

### 8.1 Verification Steps
1. ✅ Search codebase for `$inferSelect` outside service/mapper layers
2. ✅ Search for direct `import { db }` in components
3. ✅ Search for schema imports in components
4. ✅ Run TypeScript compilation
5. ✅ Run all tests
6. ✅ Manual testing of key flows

### 8.2 Verification Commands
```bash
# Find schema imports in components
rg "from ['\"]@/lib/schema" src/components/

# Find $inferSelect usage outside services/mappers
rg "\$inferSelect" src/ --glob "!src/services/**" --glob "!src/domain/mappers/**"

# Find direct db imports in components
rg "from ['\"]@/lib/db" src/components/

# TypeScript check
npm run build

# Run tests
npm test
```

### 8.3 Success Criteria
- ✅ No components import from `lib/schema`
- ✅ No components use `$inferSelect` types
- ✅ All DB queries in `services/` layer
- ✅ Clean type flow: DB → Mapper → Domain → DTO → Network
- ✅ All tests pass
- ✅ Application builds without errors
- ✅ Existing functionality preserved

---

## Implementation Timeline

### Estimated Effort
- **Phase 3 (Services):** ~2-3 hours
- **Phase 4 (DTOs):** ~1 hour
- **Phase 5 (API Routes):** ~2-3 hours
- **Phase 6 (Components):** ~3-4 hours
- **Phase 7 (Workers):** ~30 minutes
- **Phase 8 (Verification):** ~1 hour
- **Total:** ~10-12 hours

### Recommended Approach
1. **Vertical Slice:** Complete one feature end-to-end first
   - Example: Role Listings (Service → DTO → API → Component)
   - Proves the pattern works before full migration
   
2. **Incremental Migration:** Feature by feature
   - Can test after each feature
   - Can commit working code frequently
   - Reduces risk

3. **Parallel Work:** Some phases can overlap
   - Create all services first (Phase 3)
   - Then migrate APIs and components in parallel
   
---

## Risk Mitigation

### Risks & Mitigations
1. **Breaking Changes**
   - Mitigation: Comprehensive test suite
   - Mitigation: Feature flags for gradual rollout
   
2. **Type Mismatches**
   - Mitigation: Strict TypeScript checks
   - Mitigation: Mapper unit tests
   
3. **Performance Issues**
   - Mitigation: Keep DB queries unchanged
   - Mitigation: Profile before/after
   
4. **Lost Functionality**
   - Mitigation: Detailed checklist
   - Mitigation: Manual testing plan

---

## Next Steps

**Immediate:**
1. ✅ Complete service layer (Phase 3)
2. ✅ Create DTOs (Phase 4)
3. ✅ Migrate one vertical slice (role listings)
4. Test and validate the pattern
5. Continue with remaining entities

**Current Status:** Ready to begin Phase 3 (Service Layer)
