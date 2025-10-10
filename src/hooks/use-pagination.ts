import { useState, useEffect, useMemo } from 'react';

interface UsePaginationProps {
  data: any[];
  itemsPerPage: number;
  enabled?: boolean;
}

export function usePagination<T>({ data, itemsPerPage, enabled = true }: UsePaginationProps & { data: T[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  // إعادة تعيين الصفحة عند تغيير البيانات
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const paginatedData = useMemo(() => {
    if (!enabled) return data;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage, enabled]);

  const totalPages = enabled ? Math.ceil(data.length / itemsPerPage) : 1;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    totalItems: data.length,
    startIndex: enabled ? (currentPage - 1) * itemsPerPage + 1 : 1,
    endIndex: enabled ? Math.min(currentPage * itemsPerPage, data.length) : data.length,
  };
}