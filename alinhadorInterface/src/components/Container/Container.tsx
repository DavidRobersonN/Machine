import './styles.css'

type ContainerProps = {
  children: React.ReactNode
}

export function Container({ children }: ContainerProps) {
  return <div className="app-container">{children}</div>
}