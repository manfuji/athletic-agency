import { notFound } from "next/navigation";
import PublicFormClient from "@/components/forms/PublicFormClient";
import {
  fetchPublicForm,
  getPublicFormSession,
} from "@/actions/data-forms";

export const dynamic = "force-dynamic";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loaded = await fetchPublicForm(slug);
  if ("error" in loaded) notFound();

  const session = await getPublicFormSession();

  return (
    <main className="px-[18px] lg:px-20 py-10 font-inter max-w-3xl mx-auto">
      <h1 className="font-evogria text-2xl mb-2">{loaded.form.title}</h1>
      {loaded.form.description && (
        <p className="text-sm text-muted-foreground mb-6">{loaded.form.description}</p>
      )}
      <PublicFormClient
        form={loaded.form}
        fields={loaded.fields}
        initialSession={session}
      />
    </main>
  );
}
