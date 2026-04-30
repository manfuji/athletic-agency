import { fetchCategories } from "@/actions/categories";
import CategoryHeader from "@/components/categories/CategoryHeader";
import CategoryTable from "@/components/categories/CategoryTable";
import { Category } from "@/types/categories";

export const dynamic = "force-dynamic";

export default async function Categories() {
  const categories = (await fetchCategories()) as Category[];
  return (
    <div className="w-[100%] 2xl:w-[50%] px-4 py-6 ml-0 mr-auto">
      <CategoryHeader />
      <CategoryTable initialCategories={categories} />
    </div>
  );
}
