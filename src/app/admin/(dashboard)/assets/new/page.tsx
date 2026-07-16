import { AssetForm } from "@/app/admin/AssetForm";
import { createAssetAction } from "@/app/admin/actions";
import { listAssignees, listGroups, listLocations } from "@/lib/store";

export default function NewAssetPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add asset</h1>
      <AssetForm
        action={createAssetAction}
        submitLabel="Create asset"
        existingGroups={listGroups()}
        existingLocations={listLocations()}
        existingAssignees={listAssignees()}
      />
    </div>
  );
}
