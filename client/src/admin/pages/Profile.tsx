import { useProfile, type Profile } from "@/hooks/useProfile";
import JsonEditor from "../components/JsonEditor";
import { api } from "@/lib/api";

export default function ProfileAdmin() {
  const { data, loading, refetch } = useProfile();

  const handleSave = async (newData: Profile) => {
    await api.patch("/profile", newData);
    await refetch();
  };

  return (
    <JsonEditor<Profile>
      title="Profile"
      description="Manage your main bio, hero text, and basic information."
      data={data}
      loading={loading}
      onSave={handleSave}
    />
  );
}
