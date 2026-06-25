import { useSocials, type Social } from "@/hooks/useSocials";
import JsonEditor from "../components/JsonEditor";
import { api } from "@/lib/api";

export default function SocialsAdmin() {
  const { data, loading, refetch } = useSocials();

  const handleSave = async (newData: Social[]) => {
    await api.put("/socials", newData);
    await refetch();
  };

  return (
    <JsonEditor<Social[]>
      title="Socials"
      description="Manage your social links displayed in the contact section."
      data={data || []}
      loading={loading}
      onSave={handleSave}
    />
  );
}
