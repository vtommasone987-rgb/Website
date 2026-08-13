import { AssetForm } from "@/app/admin/AssetForm";
import { createAssetAction } from "@/app/admin/actions";
import { listAssignees, listGroups, listLocations } from "@/lib/store";

export default async function NewAssetPage() {
  const [existingGroups, existingLocations, existingAssignees] = await Promise.all([
    listGroups(),
    listLocations(),
    listAssignees(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add asset</h1>
      <AssetForm
        action={createAssetAction}
        submitLabel="Create asset"
        existingGroups={existingGroups}
        existingLocations={existingLocations}
        existingAssignees={existingAssignees}
      />
    </div>
  );
}
