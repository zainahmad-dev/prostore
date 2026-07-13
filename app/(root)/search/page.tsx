import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/shared/pagination';
import ProductList from '@/components/shared/product/product-list';
import { getAllCategories, getAllProducts } from '@/lib/actions/product.actions';

const sortOrders = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
];

export async function generateMetadata(props: {
  searchParams: Promise<{ q?: string; category?: string }>;
}): Promise<Metadata> {
  const { q = 'all', category = 'all' } = await props.searchParams;

  const isQuerySet = q && q !== 'all' && q.trim() !== '';
  const isCategorySet = category && category !== 'all' && category.trim() !== '';

  if (isQuerySet || isCategorySet) {
    return {
      title: `Search ${isQuerySet ? q : ''} ${
        isCategorySet ? `: Category ${category}` : ''
      }`,
    };
  }

  return { title: 'Search Products' };
}

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = 'all',
    category = 'all',
    sort = 'newest',
    page = '1',
  } = await props.searchParams;

  const products = await getAllProducts({
    query: q,
    category,
    sort,
    page: Number(page),
  });

  const categories = await getAllCategories();

  const hasFilters =
    (q !== 'all' && q !== '') || (category !== 'all' && category !== '');

  const getFilterUrl = ({ c, s }: { c?: string; s?: string }) => {
    const params = { q, category, sort, page: '1' };
    if (c) params.category = c;
    if (s) params.sort = s;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div className="filter-links space-y-4">
        <div>
          <div className="text-xl font-bold mb-2 mt-3">Category</div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${
                  category === 'all' || category === '' ? 'font-bold' : ''
                }`}
                href={getFilterUrl({ c: 'all' })}
              >
                Any
              </Link>
            </li>
            {categories.map((x) => (
              <li key={x.category}>
                <Link
                  className={`${category === x.category ? 'font-bold' : ''}`}
                  href={getFilterUrl({ c: x.category })}
                >
                  {x.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col md:flex-row gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {q !== 'all' && q !== '' && <span>Query: {q}</span>}
            {category !== 'all' && category !== '' && (
              <span>Category: {category}</span>
            )}
            {hasFilters && (
              <Button asChild variant="link" size="sm">
                <Link href="/search">Clear Filters</Link>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            Sort by
            {sortOrders.map((s) => (
              <Link
                key={s.value}
                className={`px-2 ${sort === s.value ? 'font-bold' : ''}`}
                href={getFilterUrl({ s: s.value })}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <ProductList data={products.data} />

        {products.totalPages > 1 && (
          <Pagination page={Number(page) || 1} totalPages={products.totalPages} />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
