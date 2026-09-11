import { createContext, useContext, useState, useMemo } from 'react';

const FilterContext = createContext();

const INITIAL_FILTERS = {
  cohort: "",
  district: "",
  provider: "",
  course: "",
  gender: "",
  ageGroup: "",
  category: ""
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);

  const updateFilter = (key, value) => {
    setIsFilterTransitioning(true);
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => setIsFilterTransitioning(false), 80);
  };

  const clearFilters = () => {
    setIsFilterTransitioning(true);
    setFilters(INITIAL_FILTERS);
    setTimeout(() => setIsFilterTransitioning(false), 80);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => Boolean(v)).length;
  }, [filters]);

  const getQueryString = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return params.toString();
  };

  return (
    <FilterContext.Provider value={{ 
      filters, 
      updateFilter, 
      clearFilters, 
      activeFilterCount, 
      isFilterTransitioning,
      getQueryString 
    }}>
      {children}
    </FilterContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFilters() {
  return useContext(FilterContext);
}
