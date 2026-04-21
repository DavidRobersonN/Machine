import { ScreenSidebar } from '../SscreenSideBar/ScreenSideBar'
import { ScreenLogs } from '../ScreenLogs/ScreenLogs'

export function ScreenMain() {
  return (
    <div className="screen-main">
      <ScreenLogs />
      <ScreenSidebar />
    </div>
  )
}