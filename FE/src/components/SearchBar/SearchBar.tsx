import { useState, useEffect } from 'react'
import './SearchBar.css'

export interface SearchFilters {
  location: string
  priceRange: {
    min: number
    max: number
  }
  area: {
    min: number
    max: number
  }
  amenities: string[]
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
  showFilters?: boolean
  className?: string
}

const SearchBar = ({ 
  onSearch, 
  initialFilters,
  showFilters = false,
  className = '' 
}: SearchBarProps) => {
  const [isExpanded, setIsExpanded] = useState(showFilters)
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    priceRange: { min: 0, max: 10000000 },
    area: { min: 0, max: 100 },
    amenities: []
  })

  // Áp dụng initialFilters khi component mount
  useEffect(() => {
    if (initialFilters) {
      const updatedFilters = { ...filters, ...initialFilters }
      setFilters(updatedFilters)
      // Không gọi onSearch ở đây để tránh loop
    }
  }, []) // Chỉ chạy một lần khi mount

  const priceOptions = [
    { label: 'Tất cả', value: { min: 0, max: 10000000 } },
    { label: 'Dưới 2 triệu', value: { min: 0, max: 2000000 } },
    { label: '2 - 4 triệu', value: { min: 2000000, max: 4000000 } },
    { label: '4 - 6 triệu', value: { min: 4000000, max: 6000000 } },
    { label: 'Trên 6 triệu', value: { min: 6000000, max: 10000000 } }
  ]

  const areaOptions = [
    { label: 'Tất cả', value: { min: 0, max: 100 } },
    { label: 'Dưới 20m²', value: { min: 0, max: 20 } },
    { label: '20 - 30m²', value: { min: 20, max: 30 } },
    { label: '30 - 50m²', value: { min: 30, max: 50 } },
    { label: 'Trên 50m²', value: { min: 50, max: 100 } }
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    // Auto-search khi filters thay đổi (trừ location)
    if (Object.keys(newFilters)[0] !== 'location') {
      onSearch(updatedFilters)
    }
  }

  const resetFilters = () => {
    const resetFilters = {
      location: '',
      priceRange: { min: 0, max: 10000000 },
      area: { min: 0, max: 100 },
      amenities: []
    }
    setFilters(resetFilters)
    onSearch(resetFilters)
  }

  return (
    <div className={`search-bar ${className}`}>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-main">
          <div className="search-input-group">
            <div className="input-with-icon">
              <span className="input-icon">📍</span>
              <input
                type="text"
                placeholder="Nhập địa điểm, quận, thành phố..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="search-input"
              />
            </div>
            
            <button 
              type="button"
              className="filter-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              🎛️ Bộ lọc {isExpanded ? '▲' : '▼'}
            </button>
            
            <button type="submit" className="search-button">
              🔍 Tìm kiếm
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="search-filters">
            <div className="filter-section">
              <h4>Khoảng giá</h4>
              <div className="filter-options">
                {priceOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`filter-option ${
                      filters.priceRange.min === option.value.min && 
                      filters.priceRange.max === option.value.max ? 'active' : ''
                    }`}
                    onClick={() => handleFilterChange({ priceRange: option.value })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Diện tích</h4>
              <div className="filter-options">
                {areaOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`filter-option ${
                      filters.area.min === option.value.min && 
                      filters.area.max === option.value.max ? 'active' : ''
                    }`}
                    onClick={() => handleFilterChange({ area: option.value })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button 
                type="button" 
                className="btn-reset"
                onClick={resetFilters}
              >
                🔄 Đặt lại
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default SearchBar