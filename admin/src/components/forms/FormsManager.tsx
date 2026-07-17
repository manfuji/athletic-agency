"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/providers/query-provider";
import {
  deleteDataForm,
  fetchDataForms,
  type DataFormRow,
  updateDataForm,
} from "@/actions/data-forms";
import CreateFormModal from "@/components/forms/CreateFormModal";
import FormDetailPanel from "@/components/forms/FormDetailPanel";

function accessLabel(row: DataFormRow) {
  if (row.access_type === "public") {
    return row.requires_auth ? "Public (auth required)" : "Public";
  }
  return "Private";
}

export default function FormsManager() {
  const { data, isFetching } = useQuery({
    queryKey: ["data-forms"],
    queryFn: fetchDataForms,
  });

  const rows = useMemo(() => data ?? [], [data]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<DataFormRow | null>(null);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["data-forms"] });

  const toggleActive = async (row: DataFormRow) => {
    const res = await updateDataForm(row.id, { is_active: !row.is_active });
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Updated");
    refresh();
  };

  const doDelete = async (row: DataFormRow) => {
    const res = await deleteDataForm(row.id);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Deleted");
    if (selected?.id === row.id) setSelected(null);
    refresh();
  };

  if (selected) {
    return (
      <FormDetailPanel
        form={selected}
        onBack={() => setSelected(null)}
        onUpdated={refresh}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setCreating(true)}
          className="bg-[#302464] text-white hover:bg-[#302464] font-evogria"
        >
          Create Form
        </Button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467]">
                Title
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467]">
                Access
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467]">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467]">
                Active
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6" colSpan={5}>
                  {isFetching ? "Loading..." : "No forms yet."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-[14px] font-inter text-[#475467]">
                    {r.title}
                  </td>
                  <td className="px-6 py-4 text-[14px] font-inter text-[#475467]">
                    {accessLabel(r)}
                  </td>
                  <td className="px-6 py-4 text-[14px] font-inter text-[#475467]">
                    {r.slug}
                  </td>
                  <td className="px-6 py-4 text-[14px] font-inter text-[#475467]">
                    {r.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setSelected(r)}>
                      Manage
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleActive(r)}>
                      {r.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => doDelete(r)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <CreateFormModal
          isOpen
          onClose={() => setCreating(false)}
          onCreated={(form) => {
            setCreating(false);
            refresh();
            setSelected(form);
          }}
        />
      )}
    </div>
  );
}
