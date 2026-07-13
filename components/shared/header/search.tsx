import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllCategories } from '@/lib/actions/product.actions';
import { SearchIcon } from 'lucide-react';

const Search = async () => {
  const categories = await getAllCategories();

  return (
    <form action="/search" method="GET">
      <div className="flex w-full max-w-sm items-center gap-1">
        <select
          name="category"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm hidden sm:block"
          defaultValue="all"
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
        <Input
          name="q"
          type="text"
          placeholder="Search..."
          className="md:w-[100px] lg:w-[200px]"
        />
        <Button size="icon" variant="outline" type="submit">
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default Search;
