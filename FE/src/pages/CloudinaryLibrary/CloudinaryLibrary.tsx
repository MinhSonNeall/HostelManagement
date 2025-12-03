import { useEffect, useState } from 'react'
import { listCloudinaryImages, type CloudinaryResource } from '../../api/cloudinary'
import './CloudinaryLibrary.css'

const CloudinaryLibrary = () => {
  const [images, setImages] = useState<CloudinaryResource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [folderFilter, setFolderFilter] = useState('')
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)

  const fetchImages = async (cursor?: string, prefix?: string, append = false) => {
    try {
      setLoading(true)
      setError(null)
      const response = await listCloudinaryImages({ nextCursor: cursor, prefix })
      setImages((prev) => (append ? [...prev, ...response.resources] : response.resources))
      setNextCursor(response.next_cursor)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách ảnh')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleFilter = () => {
    fetchImages(undefined, folderFilter || undefined, false)
  }

  const handleLoadMore = () => {
    if (nextCursor) {
      fetchImages(nextCursor, folderFilter || undefined, true)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => alert('Đã copy URL ảnh vào clipboard'))
      .catch(() => alert('Không thể copy URL, vui lòng copy thủ công'))
  }

  return (
    <div className="cloudinary-library">
      <div className="library-header">
        <div>
          <h1>Thư viện ảnh Cloudinary</h1>
          <p>Quản lý ảnh đã upload trên Cloudinary và sao chép URL để sử dụng cho phòng.</p>
        </div>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Nhập folder/prefix (ví dụ: rooms/)"
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
          />
          <button onClick={handleFilter} disabled={loading}>
            {loading ? 'Đang lọc...' : 'Lọc'}
          </button>
        </div>
      </div>

      {error && <div className="cloudinary-error">{error}</div>}

      <div className="cloudinary-grid">
        {images.map((image) => (
          <div key={image.asset_id} className="cloudinary-card">
            <img src={image.secure_url} alt={image.public_id} />
            <div className="card-info">
              <p className="public-id">{image.public_id}</p>
              <div className="card-meta">
                <span>{(image.bytes / 1024).toFixed(1)} KB</span>
                <span>{image.format.toUpperCase()}</span>
              </div>
              <button onClick={() => handleCopyUrl(image.secure_url)}>
                Sao chép URL
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="cloudinary-loading">Đang tải ảnh...</p>}

      {!loading && images.length === 0 && (
        <p className="cloudinary-empty">Hiện chưa có ảnh nào phù hợp với bộ lọc.</p>
      )}

      {nextCursor && (
        <div className="load-more">
          <button onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Đang tải...' : 'Tải thêm'}
          </button>
        </div>
      )}
    </div>
  )
}

export default CloudinaryLibrary

