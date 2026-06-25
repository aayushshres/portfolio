import { useContact, type ContactInfo } from "@/hooks/useContact";
import JsonEditor from "../components/JsonEditor";
import { api } from "@/lib/api";

export default function ContactAdmin() {
  const { data, loading, refetch } = useContact();

  const handleSave = async (newData: ContactInfo) => {
    await api.patch("/contact", newData);
    await refetch();
  };

  return (
    <JsonEditor<ContactInfo>
      title="Contact Settings"
      description="Manage the heading and description for the Contact section."
      data={data}
      loading={loading}
      onSave={handleSave}
    />
  );
}
