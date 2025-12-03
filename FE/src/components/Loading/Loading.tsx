import './Loading.css'

interface LoadingProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
}

const Loading = ({ message = 'Đang tải...', size = 'medium' }: LoadingProps) => {
  const sizeClass = `loading-spinner-${size}`
  
  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClass}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}

export default Loading

