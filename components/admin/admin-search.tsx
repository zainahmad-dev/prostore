'use client';

import { Input } from '@/components/ui/input';
import { usePathname, useSearchParams } from 'next/navigation';

const AdminSearch = () => {
  const pathname = usePathname();
  const formActionUrl = pathname.includes('/admin/orders')
    ? '/admin/orders'
    : '/admin/products';

  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  return (
    <form action={formActionUrl} method="GET">
      <Input
        key={formActionUrl + query}
        type="search"
        placeholder="Search..."
        name="query"
        defaultValue={query}
        className="md:w-[100px] lg:w-[300px]"
      />
      <button className="sr-only" type="submit">
        Search
      </button>
    </form>
  );
};

export default AdminSearch;
