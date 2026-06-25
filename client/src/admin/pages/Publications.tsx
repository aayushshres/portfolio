import { usePublications, type PublicationItem } from "@/hooks/usePublications";
import JsonEditor from "../components/JsonEditor";
import { api } from "@/lib/api";

export default function PublicationsAdmin() {
  const { data, loading, refetch } = usePublications(true);

  const handleSave = async (newData: PublicationItem[]) => {
    await api.put("/publications", newData);
    await refetch();
  };

  return (
    <JsonEditor<PublicationItem[]>
      title="Publications"
      description="Manage your published papers and articles."
      data={data || []}
      loading={loading}
      onSave={handleSave}
    />
  );
}
